import {
  PackageSize,
  PackageInfo,
  PackageHistory,
  SimilarPackage,
} from "../services/bundlephobia";
import { bullet, bold, dim, success, warning, error, info } from "./colors";
import { formatSizeValues, getSizeColor } from "./sizes";

/**
 * Display basic package size information
 */
export function displayBasicInfo(pkg: PackageSize): void {
  if (!pkg || !Number.isFinite(pkg.size)) {
    console.log("No size data available");
    return;
  }

  const name = pkg.name;
  const version = pkg.version || "latest";
  const minified = formatSizeValues(pkg.size);
  const gzipped = formatSizeValues(pkg.gzip || 0);

  // Get color functions based on size
  const minColor = getSizeColor(minified.mb);
  const gzipColor = getSizeColor(gzipped.mb);

  // Display header
  console.log(`\n${bold(name)} ${dim(`v${version}`)}`);

  // Display sizes with appropriate colors
  console.log(
    bullet(
      `${
        minColor === "success"
          ? success(minified.pretty)
          : minColor === "warning"
          ? warning(minified.pretty)
          : error(minified.pretty)
      } ${dim("minified")}`
    )
  );
  console.log(
    bullet(
      `${
        gzipColor === "success"
          ? success(gzipped.pretty)
          : gzipColor === "warning"
          ? warning(gzipped.pretty)
          : error(gzipped.pretty)
      } ${dim("gzipped")}`
    )
  );

  if (pkg.dependencyCount) {
    console.log(
      bullet(`${info(String(pkg.dependencyCount))} ${dim("dependencies")}`)
    );
  }
}

/**
 * Display detailed package information
 */
export function displayDetailedInfo(
  pkg: PackageInfo,
  sizeData?: PackageSize
): void {
  if (!pkg) {
    console.log("No package information available");
    return;
  }

  console.log(`\n${bold(pkg.name)} ${dim(`v${pkg.version}`)}`);

  if (pkg.description) {
    console.log(`\n${pkg.description}`);
  }

  if (sizeData) {
    const minified = formatSizeValues(sizeData.size);
    const gzipped = formatSizeValues(sizeData.gzip);

    console.log(
      "\n" +
        bullet(
          `${dim("Bundle size:")} ${success(minified.pretty)} ${dim(
            "minified"
          )}, ${success(gzipped.pretty)} ${dim("gzipped")}`
        )
    );
  }

  console.log("\n" + bullet(`${dim("License:")} ${pkg.license || "Unknown"}`));

  if (pkg.deprecated) {
    console.log(bullet(`${error("DEPRECATED")}`));
  }

  if (pkg.downloadsLast30Days) {
    console.log(
      bullet(
        `${dim("Downloads:")} ${info(
          pkg.downloadsLast30Days.toLocaleString()
        )} ${dim("(last 30 days)")}`
      )
    );
  }

  const depCount = pkg.dependencies ? Object.keys(pkg.dependencies).length : 0;
  if (depCount > 0) {
    console.log(bullet(`${dim("Dependencies:")} ${info(String(depCount))}`));
  }

  if (pkg.types) {
    console.log(bullet(`${dim("Types:")} ${pkg.types}`));
  }

  if (pkg.keywords && pkg.keywords.length > 0) {
    console.log(
      bullet(
        `${dim("Keywords:")} ${pkg.keywords.slice(0, 5).join(", ")}${
          pkg.keywords.length > 5 ? ", ..." : ""
        }`
      )
    );
  }

  if (pkg.owners && pkg.owners.length > 0) {
    console.log(
      bullet(
        `${dim("Maintainers:")} ${pkg.owners.map((o) => o.name).join(", ")}`
      )
    );
  }

  if (pkg.homepage) {
    console.log(bullet(`${dim("Homepage:")} ${pkg.homepage}`));
  }

  if (pkg.repository) {
    console.log(bullet(`${dim("Repository:")} ${pkg.repository}`));
  }
}

/**
 * Display package dependencies
 */
export function displayDependencies(pkg: PackageSize): void {
  if (!pkg.dependencySizes || pkg.dependencySizes.length === 0) {
    console.log("No dependency information available");
    return;
  }

  console.log(`\n${bold(pkg.name)} ${dim(`dependencies:`)}`);

  // Sort dependencies by size
  const sortedDeps = [...pkg.dependencySizes].sort(
    (a, b) => b.approximateSize - a.approximateSize
  );

  for (const dep of sortedDeps) {
    const size = formatSizeValues(dep.approximateSize);
    const sizeColor = getSizeColor(size.mb);
    const coloredSize =
      sizeColor === "success"
        ? success(size.pretty)
        : sizeColor === "warning"
        ? warning(size.pretty)
        : error(size.pretty);

    console.log(bullet(`${bold(dep.name)} ${dim("-")} ${coloredSize}`));
  }
}

/**
 * Display similar packages
 */
export function displaySimilar(packages: SimilarPackage[]): void {
  if (!packages || packages.length === 0) {
    console.log("No similar packages found");
    return;
  }

  console.log(`\n${bold("Similar packages:")}`);

  for (const pkg of packages) {
    const versionLabel = pkg.version ? ` ${dim(`v${pkg.version}`)}` : "";
    console.log(`\n${bullet(bold(pkg.name))}${versionLabel}`);

    if (pkg.description) {
      console.log(`  ${pkg.description}`);
    }

    if (pkg.size && pkg.gzip) {
      const minified = formatSizeValues(pkg.size);
      const gzipped = formatSizeValues(pkg.gzip);

      const minColor = getSizeColor(minified.mb);
      const gzipColor = getSizeColor(gzipped.mb);

      console.log(
        `  ${dim("Size:")} ${
          minColor === "success"
            ? success(minified.pretty)
            : minColor === "warning"
            ? warning(minified.pretty)
            : error(minified.pretty)
        } ${dim("minified")}, ${
          gzipColor === "success"
            ? success(gzipped.pretty)
            : gzipColor === "warning"
            ? warning(gzipped.pretty)
            : error(gzipped.pretty)
        } ${dim("gzipped")}`
      );
    }
  }
}

/**
 * Display package version history
 */
export function displayHistory(
  history: PackageHistory[],
  packageName: string
): void {
  if (!history || history.length === 0) {
    console.log("No version history found");
    return;
  }

  console.log(`\n${bold(packageName)} ${dim("version history:")}`);

  const sortedHistory = [...history].sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true })
  );

  for (const version of sortedHistory) {
    const minified = formatSizeValues(version.size);
    const gzipped = formatSizeValues(version.gzip);

    const minColor = getSizeColor(minified.mb);
    const gzipColor = getSizeColor(gzipped.mb);

    console.log(`\n${bullet(bold(`v${version.version}`))}`);
    console.log(
      `  ${dim("Minified:")} ${
        minColor === "success"
          ? success(minified.pretty)
          : minColor === "warning"
          ? warning(minified.pretty)
          : error(minified.pretty)
      }`
    );
    console.log(
      `  ${dim("Gzipped:")} ${
        gzipColor === "success"
          ? success(gzipped.pretty)
          : gzipColor === "warning"
          ? warning(gzipped.pretty)
          : error(gzipped.pretty)
      }`
    );
  }
}
