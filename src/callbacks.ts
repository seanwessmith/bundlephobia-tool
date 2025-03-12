import type { Ora } from "ora";
import open from "open";

/**
 * Represents a size measurement with kilobytes and megabytes
 */
interface Size {
  kb: string;
  mb: string;
}

/**
 * Interface for version data used in history
 */
interface VersionData {
  version: string;
  gzip: number;
  size: number;
  [key: string]: any;
}

/**
 * Wrapper function for Bun.color with automatic reset
 */
export const colorize = (color: string, text: string): string => {
  return Bun.color(color) + text + Bun.color("reset");
};

/**
 * Utility for creating a formatted bullet point
 */
const bullet = (text: string) => `${colorize("yellow", "•")} ${text}`;

/**
 * Convert bytes to human-readable size formats
 */
export const convert = (size: number): Size => ({
  kb: calculate(size, 1),
  mb: calculate(size, 2),
});

/**
 * Calculate size based on powers of 1024
 */
const calculate = (value: number, pow: number): string =>
  (value / Math.pow(1024, pow)).toFixed(1);

/**
 * Determine the most appropriate unit for displaying size
 */
const sizeUnit = (size: Size): string =>
  parseFloat(size.mb) >= 1 ? size.mb + " MB" : size.kb + " kB";

/**
 * Get colored text based on size value
 */
const getColoredSizeText = (size: string, output: string): string => {
  const float = parseFloat(size);

  if (float < 0.5) return colorize("green", output);
  if (float >= 1) return colorize("yellow", output);
  return colorize("red", output);
};

/**
 * Log colored size output
 */
const logColoredSize = (size: string, output: string): void => {
  console.log(getColoredSizeText(size, output));
};

/**
 * Extended package.json interface
 */
export interface PackageJson {
  name: string;
  version: number | string;
  description?: string;
  dependents?: number;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>[];
  types?: Record<string, string>;
  license?: string;
  keywords?: string[];
  deprecated?: boolean;
  popular?: boolean;
  humanDownloadsLast30Days?: number;
  lastCrawl?: string;
  owners?: Array<{ name: string }>;
  dependencyCount?: number;
  dependencySizes?: Array<{ name: string; approximateSize: number }>;
  gzip?: number;
  size?: number;
}

/**
 * Safely access object properties with fallback values
 */
const safeGet = <T, K extends keyof T>(
  obj: T | undefined,
  key: K,
  fallback: T[K]
): T[K] => {
  if (!obj) return fallback;
  return obj[key] !== undefined ? obj[key] : fallback;
};

/**
 * Display raw package data
 */
export const raw = (spinner: Ora, pkg: PackageJson): void => {
  spinner.succeed(colorize("gray", `${pkg.name}@${pkg.version}`));
  console.log(pkg);
};

/**
 * Display basic package size information
 */
export const basic = (
  spinner: Ora,
  pkg: { name: string; version: number | string; gzip?: number; size?: number }
): void => {
  // Handle missing size data gracefully
  const gzip = safeGet(pkg, "gzip", 0);
  const size = safeGet(pkg, "size", 0);

  if (!gzip || !size) {
    console.log("Could not find any size data");
    return;
  }

  const zip = convert(gzip);
  const regular = convert(size);

  spinner.succeed(colorize("gray", `${pkg.name}@${pkg.version}`));

  console.log(
    "\t" +
      bullet(
        getColoredSizeText(regular.mb, sizeUnit(regular)) +
          " " +
          colorize("gray", "minified")
      )
  );
  console.log(
    "\t" +
      bullet(
        getColoredSizeText(zip.mb, sizeUnit(zip)) +
          " " +
          colorize("gray", "gzipped")
      )
  );
};

/**
 * Open package in browser
 */
export const browser = (spinner: Ora, pkg: PackageJson): void => {
  try {
    // Assuming open is defined elsewhere or will be imported
    open(`https://bundlephobia.com/result?p=${pkg.name}`);
    spinner.succeed(
      colorize(
        "gray",
        `opened ${pkg.name}@${pkg.version} in your default browser`
      )
    );
  } catch (error) {
    spinner.fail(`Failed to open browser: ${error}`);
  }
};

/**
 * Show similar packages
 */
export const similar = (
  spinner: Ora,
  pkg: {
    name: string;
    version: number | string;
    category?: { similar: PackageJson[] };
  }
): void => {
  const similarPkgs = safeGet(pkg.category, "similar", []);
  const count = similarPkgs.length;

  if (count > 0) {
    spinner.succeed(
      pkg.name +
        colorize("gray", ` ${count} similar pkg${count > 1 ? "s" : ""}`)
    );
    similarPkgs.forEach((pkg) => console.log(pkg));
  } else {
    spinner.fail("Could not find any similar packages");
  }
};

/**
 * Display package information
 */
export const info = (spinner: Ora, pkg: PackageJson): void => {
  spinner.succeed(`${pkg.name}` + colorize("gray", `@${pkg.version}`));

  const dependencies = safeGet(pkg, "dependencies", {});
  const devDependencies = safeGet(pkg, "devDependencies", {});
  const keywords = safeGet(pkg, "keywords", []);
  const types = safeGet(pkg, "types", {});
  const owners = safeGet(pkg, "owners", []);

  if (!dependencies || !devDependencies || !keywords || !types || !owners) {
    console.log("Could not find any package information");
    return;
  }

  console.log({
    project: pkg.name,
    version: pkg.version,
    description: safeGet(pkg, "description", ""),
    dependents: safeGet(pkg, "dependents", 0),
    dependencies: Object.keys(dependencies).length,
    devDepends: Object.keys(devDependencies).length,
    types: Object.values(types).toString() || "none",
    license: safeGet(pkg, "license", "unknown"),
    keywords:
      keywords.length > 5
        ? keywords.slice(0, 5).toString() + ", ..."
        : keywords.toString() || "none",
    deprecated: safeGet(pkg, "deprecated", false),
    popular: safeGet(pkg, "popular", false),
    downloads: safeGet(pkg, "humanDownloadsLast30Days", 0),
    crawled: safeGet(pkg, "lastCrawl", ""),
    authors: owners.map((owner) => owner.name).join(", ") || "unknown",
  });
};

/**
 * Display version history
 */
export const history = (spinner: Ora, pkg: any, input: string): void => {
  // Package history comes in various formats, we need to handle it flexibly
  const versionHistory: VersionData[] = Array.isArray(pkg)
    ? pkg
    : Object.values(pkg).filter((v) => v && typeof v === "object");

  const count = versionHistory.length;

  spinner.succeed(
    input + colorize("gray", ` ${count} version${count > 1 ? "s" : ""}`)
  );

  versionHistory.forEach((version) => {
    // Ensure version has the required properties
    if (version && version.version && version.gzip && version.size) {
      const zip = convert(version.gzip);
      const regular = convert(version.size);

      console.log(`\n${input}` + colorize("gray", `@${version.version}`));
      logColoredSize(
        regular.mb,
        sizeUnit(regular) + colorize("gray", " minified")
      );
      logColoredSize(zip.mb, sizeUnit(zip) + colorize("gray", " gzipped"));
    }
  });
};

/**
 * Display package dependencies
 */
export const dependencies = (spinner: Ora, pkg: PackageJson): void => {
  spinner.succeed(`${pkg.name}` + colorize("gray", `@${pkg.version}`));

  const dependencySizes = safeGet(pkg, "dependencySizes", []);
  const dependencyCount = safeGet(pkg, "dependencyCount", 0);

  if (dependencyCount === 0 || dependencySizes?.length === 0) {
    console.log("Could not find any dependencies");
    return;
  }

  dependencySizes?.forEach((dependency) => {
    const size = convert(dependency.approximateSize);
    console.log(
      `${dependency.name}: ${getColoredSizeText(size.mb, sizeUnit(size))}`
    );
  });
};

/**
 * Display peer dependencies
 */
export const peers = (spinner: Ora, pkg: PackageJson): void => {
  spinner.succeed(`${pkg.name}` + colorize("gray", `@${pkg.version}`));

  const peerDependencies = safeGet(pkg, "peerDependencies", []);

  if (!peerDependencies || peerDependencies.length === 0) {
    console.log("Could not find any peers");
    return;
  }

  peerDependencies.forEach((peer) => console.log(peer));
};

export { logColoredSize as sizeColor }; // For backwards compatibility
