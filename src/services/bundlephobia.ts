import { parsePackageSpecifier } from "../utils/packages";

// API configuration
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const BUNDLEPHOBIA_API_BASE = "https://bundlephobia.com/api";
const NPM_REGISTRY_API_BASE = "https://registry.npmjs.org";
const NPM_DOWNLOADS_API_BASE = "https://api.npmjs.org/downloads/point/last-month";
const HISTORY_LIMIT = 12;

// Define API types
export interface PackageSize {
  name: string;
  version: string;
  description?: string;
  repository?: string;
  size: number;
  gzip: number;
  dependencyCount?: number;
  hasJSModule?: boolean;
  hasJSNext?: boolean;
  hasSideEffects?: boolean;
  dependencies?: Record<string, string>;
  dependencySizes?: Array<{ name: string; approximateSize: number }>;
}

export interface PackageHistory {
  version: string;
  size: number;
  gzip: number;
}

export interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  deprecated?: boolean;
  downloadsLast30Days?: number;
  types?: string;
  owners?: Array<{ name: string; email?: string }>;
}

export interface SimilarPackage {
  name: string;
  version?: string;
  description?: string;
  size?: number;
  gzip?: number;
}

interface NpmPackumentVersion {
  version: string;
  description?: string;
  license?: string;
  homepage?: string;
  repository?: string | { url?: string };
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  deprecated?: string;
  maintainers?: Array<{ name: string; email?: string }>;
  typings?: string;
  types?: string;
}

interface NpmPackument {
  name: string;
  "dist-tags"?: { latest?: string };
  maintainers?: Array<{ name: string; email?: string }>;
  versions?: Record<string, NpmPackumentVersion>;
}

interface NpmDownloadsResponse {
  downloads?: number;
}

function buildPackageQueryUrl(endpoint: string, packageName: string): string {
  const url = new URL(`${BUNDLEPHOBIA_API_BASE}/${endpoint}`);
  url.searchParams.set("package", packageName);
  return url.toString();
}

function normalizeRepositoryUrl(
  repository?: string | { url?: string }
): string | undefined {
  if (!repository) {
    return undefined;
  }

  const value = typeof repository === "string" ? repository : repository.url;
  return value?.replace(/^git\+/, "").replace(/\.git$/, "");
}

export function normalizePackageHistory(
  data: Record<string, unknown> | PackageHistory[]
): PackageHistory[] {
  const entries = Array.isArray(data)
    ? data
    : Object.entries(data).map(([version, details]) => ({
        version,
        ...(typeof details === "object" && details !== null ? details : {}),
      }));

  return entries
    .filter((entry): entry is PackageHistory => {
      const candidate = entry as Partial<PackageHistory>;
      return (
        typeof candidate.version === "string" &&
        Number.isFinite(candidate.size) &&
        Number.isFinite(candidate.gzip)
      );
    })
    .sort((a, b) =>
      b.version.localeCompare(a.version, undefined, { numeric: true })
    )
    .slice(0, HISTORY_LIMIT);
}

export function normalizeSimilarPackageNames(data: unknown): string[] {
  if (
    !data ||
    typeof data !== "object" ||
    !("category" in data) ||
    typeof (data as { category?: unknown }).category !== "object" ||
    (data as { category?: unknown }).category === null
  ) {
    return [];
  }

  const similar = (
    (data as { category?: { similar?: unknown } }).category?.similar ?? []
  ) as unknown[];

  return similar.filter((item): item is string => typeof item === "string");
}

/**
 * Fetch with timeout and retry logic
 */
async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok && attempt < retries) {
        // Retry on 5xx errors or 429 (rate limit)
        if (response.status >= 500 || response.status === 429) {
          const delayMs =
            response.status === 429
              ? 2000 * (attempt + 1)
              : 1000 * (attempt + 1);
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs)
          );
          continue;
        }
      }

      return response;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Fetch package size data from bundlephobia API
 */
export async function fetchPackageSize(
  packageName: string
): Promise<PackageSize> {
  const response = await fetchWithRetry(buildPackageQueryUrl("size", packageName));

  if (!response.ok) {
    throw new Error(
      `Failed to fetch size data for ${packageName}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as PackageSize;
}

/**
 * Fetch package information from the npm registry and downloads API
 */
export async function fetchPackageInfo(
  packageName: string
): Promise<PackageInfo> {
  const { name, version } = parsePackageSpecifier(packageName);
  const packumentResponse = await fetchWithRetry(
    `${NPM_REGISTRY_API_BASE}/${encodeURIComponent(name)}`
  );

  if (!packumentResponse.ok) {
    throw new Error(
      `Failed to fetch package info for ${packageName}: ${packumentResponse.status} ${packumentResponse.statusText}`
    );
  }

  const downloadsResponse = await fetchWithRetry(
    `${NPM_DOWNLOADS_API_BASE}/${encodeURIComponent(name)}`
  );

  if (!downloadsResponse.ok) {
    throw new Error(
      `Failed to fetch download stats for ${packageName}: ${downloadsResponse.status} ${downloadsResponse.statusText}`
    );
  }

  const packument = (await packumentResponse.json()) as NpmPackument;
  const downloads = (await downloadsResponse.json()) as NpmDownloadsResponse;
  const latestVersion = packument["dist-tags"]?.latest;
  const selectedVersion =
    (version ? packument.versions?.[version] : undefined) ??
    (latestVersion ? packument.versions?.[latestVersion] : undefined);

  if (!selectedVersion) {
    throw new Error(`No npm metadata found for ${packageName}`);
  }

  return {
    name: packument.name,
    version: selectedVersion.version,
    description: selectedVersion.description,
    license: selectedVersion.license,
    homepage: selectedVersion.homepage,
    repository: normalizeRepositoryUrl(selectedVersion.repository),
    keywords: selectedVersion.keywords,
    dependencies: selectedVersion.dependencies,
    devDependencies: selectedVersion.devDependencies,
    peerDependencies: selectedVersion.peerDependencies,
    deprecated: Boolean(selectedVersion.deprecated),
    downloadsLast30Days: downloads.downloads,
    types: selectedVersion.types || selectedVersion.typings,
    owners: selectedVersion.maintainers || packument.maintainers,
  };
}

/**
 * Fetch similar packages from bundlephobia API
 */
export async function fetchSimilarPackages(
  packageName: string
): Promise<SimilarPackage[]> {
  const response = await fetchWithRetry(
    buildPackageQueryUrl("similar-packages", packageName)
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch similar packages for ${packageName}: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const similarNames = normalizeSimilarPackageNames(data);
  const details: SimilarPackage[] = [];
  const batchSize = 2;

  for (let index = 0; index < similarNames.length; index += batchSize) {
    const batch = similarNames.slice(index, index + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (similarName) => {
        try {
          const sizeData = await fetchPackageSize(similarName);

          return {
            name: sizeData.name,
            version: sizeData.version,
            description: sizeData.description,
            size: sizeData.size,
            gzip: sizeData.gzip,
          } satisfies SimilarPackage;
        } catch {
          return {
            name: similarName,
          } satisfies SimilarPackage;
        }
      })
    );

    details.push(...batchResults);
  }

  return details;
}

/**
 * Fetch package version history from bundlephobia API
 */
export async function fetchPackageHistory(
  packageName: string
): Promise<PackageHistory[]> {
  const response = await fetchWithRetry(
    buildPackageQueryUrl("package-history", packageName)
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch package history for ${packageName}: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as Record<string, unknown> | PackageHistory[];
  return normalizePackageHistory(data);
}
