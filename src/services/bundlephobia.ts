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
 * Fetch package size data from bundlephobia API
 */
export async function fetchPackageSize(
  packageName: string
): Promise<PackageSize> {
  const response = await fetch(
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
  const response = await fetch(
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
  const response = await fetch(
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
  const response = await fetch(
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
