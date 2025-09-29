// API configuration
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

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
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  deprecated?: boolean;
  humanDownloadsLast30Days?: number;
  dependents?: number;
  types?: string;
  owners?: Array<{ name: string; email?: string }>;
}

export interface SimilarPackage {
  name: string;
  version: string;
  description?: string;
  size?: number;
  gzip?: number;
}

/**
 * Fetch with timeout and retry logic
 */
async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok && attempt < retries) {
        // Retry on 5xx errors or 429 (rate limit)
        if (response.status >= 500 || response.status === 429) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
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
  const response = await fetchWithRetry(
    `https://bundlephobia.com/api/size?package=${packageName}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch size data for ${packageName}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as PackageSize;
}

/**
 * Fetch package information from npm registry/algolia
 */
export async function fetchPackageInfo(
  packageName: string
): Promise<PackageInfo> {
  const encodedName = encodeURIComponent(packageName);
  const response = await fetchWithRetry(
    `https://ofcncog2cu-dsn.algolia.net/1/indexes/npm-search/${encodedName}?x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=f54e21fa3a2a0160595bb058179bfb1e`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch package info for ${packageName}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as PackageInfo;
}

/**
 * Fetch similar packages from bundlephobia API
 */
export async function fetchSimilarPackages(
  packageName: string
): Promise<SimilarPackage[]> {
  const response = await fetchWithRetry(
    `https://bundlephobia.com/api/similar-packages?package=${packageName}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch similar packages for ${packageName}: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return (data?.category?.similar || []) as SimilarPackage[];
}

/**
 * Fetch package version history from bundlephobia API
 */
export async function fetchPackageHistory(
  packageName: string
): Promise<PackageHistory[]> {
  const response = await fetchWithRetry(
    `https://bundlephobia.com/api/package-history?package=${packageName}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch package history for ${packageName}: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  // Convert object of versions to array if needed
  if (Array.isArray(data)) {
    return data as PackageHistory[];
  }

  return Object.values(data).filter(Boolean) as PackageHistory[];
}
