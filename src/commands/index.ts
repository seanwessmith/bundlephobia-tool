import ora from "ora";
import open from "open";
import { promises as fs } from "fs";
import path from "path";
import {
  fetchPackageSize,
  fetchPackageInfo,
  fetchSimilarPackages,
  fetchPackageHistory,
} from "../services/bundlephobia";
import {
  displayBasicInfo,
  displayDetailedInfo,
  displayDependencies,
  displaySimilar,
  displayHistory,
} from "../utils/display";
import { error, success, warning } from "../utils/colors";
import { buildDependencyRequest } from "../utils/packages";
import { formatSize } from "../utils/sizes";

export interface PackageOptions {
  raw?: boolean;
  info?: boolean;
  dependencies?: boolean;
  similar?: boolean;
  history?: boolean;
}

export interface DepOptions {
  all?: boolean;
  path?: string;
}

export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

/**
 * Analyze a single package
 */
export async function analyze(
  packageName: string,
  options: PackageOptions
): Promise<void> {
  const spinner = ora(`Analyzing ${packageName}...`).start();

  try {
    if (options.history) {
      const history = await fetchPackageHistory(packageName);
      spinner.succeed(`Version history for ${packageName}`);
      displayHistory(history, packageName);
      return;
    }

    if (options.similar) {
      const similar = await fetchSimilarPackages(packageName);
      spinner.succeed(`Similar packages to ${packageName}`);
      displaySimilar(similar);
      return;
    }

    if (options.info) {
      const sizeData = await fetchPackageSize(packageName).catch(() => null);
      const infoTarget = sizeData
        ? `${sizeData.name}@${sizeData.version}`
        : packageName;
      const infoData = await fetchPackageInfo(infoTarget);
      spinner.succeed(`Package info for ${packageName}`);
      displayDetailedInfo(infoData, sizeData ?? undefined);
      return;
    }

    const sizeData = await fetchPackageSize(packageName);

    if (options.raw) {
      spinner.succeed(`Raw data for ${packageName}`);
      console.log(JSON.stringify(sizeData, null, 2));
      return;
    }

    if (options.dependencies) {
      spinner.succeed(`Dependencies for ${packageName}`);
      displayDependencies(sizeData);
      return;
    }

    // Default display: basic info
    spinner.succeed(`Size info for ${packageName}`);
    displayBasicInfo(sizeData);
  } catch (err) {
    spinner.fail(
      `Error analyzing ${packageName}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    throw err;
  }
}

/**
 * Open package in browser
 */
export async function openPackage(packageName: string): Promise<void> {
  const spinner = ora(`Opening ${packageName} in browser...`).start();

  try {
    await open(
      `https://bundlephobia.com/result?p=${encodeURIComponent(packageName)}`
    );
    spinner.succeed(`Opened ${packageName} in your default browser`);
  } catch (err) {
    spinner.fail(
      `Failed to open browser: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    throw err;
  }
}

/**
 * Analyze dependencies from package.json
 */
export async function analyzeDependencies(options: DepOptions): Promise<void> {
  const spinner = ora("Reading package.json...").start();

  try {
    let filePath = options.path || "./package.json";
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      filePath = path.join(filePath, "package.json");
    }

    const fileContent = await fs.readFile(filePath, "utf-8");
    const packageData = JSON.parse(fileContent) as PackageJson;

    // Get dependencies
    const deps = {
      ...(packageData.dependencies || {}),
      ...(options.all ? packageData.devDependencies || {} : {}),
    };

    const dependencyRequests = Object.entries(deps)
      .filter(([name]) => !name.startsWith("@types/"))
      .map(([name, spec]) => ({
        name,
        spec,
        request: buildDependencyRequest(name, spec),
      }));

    const supportedRequests = dependencyRequests.filter(({ request }) => request);

    if (supportedRequests.length === 0) {
      spinner.fail("No supported dependencies found in package.json");
      throw new Error("No supported dependencies found in package.json");
    }

    spinner.text = `Analyzing ${supportedRequests.length} packages...`;

    // Process dependencies in batches to avoid rate limiting
    const batchSize = 3;
    let totalSize = 0;
    let gzipSize = 0;
    let successCount = 0;
    let failCount = 0;
    const skipped = dependencyRequests.filter(({ request }) => !request);
    const successes: Array<{
      data: Awaited<ReturnType<typeof fetchPackageSize>>;
    }> = [];

    for (let i = 0; i < supportedRequests.length; i += batchSize) {
      const batch = supportedRequests.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async ({ name, request }) => {
          try {
            const data = await fetchPackageSize(request!.request);
            return { dep: name, data, success: true as const };
          } catch (error) {
            return { dep: name, error, success: false as const };
          }
        })
      );

      // Process results
      for (const result of results) {
        if (result.success && result.data) {
          successes.push({
            data: result.data,
          });
          totalSize += result.data.size || 0;
          gzipSize += result.data.gzip || 0;
          successCount++;
        } else {
          console.log(`${result.dep}: ${error("Failed to fetch data")}`);
          failCount++;
        }
      }

      // Update spinner text
      spinner.text = `Analyzed ${i + batch.length}/${
        supportedRequests.length
      } packages...`;
    }

    const sortedResults = successes.sort((a, b) => b.data.size - a.data.size);

    for (const result of sortedResults) {
      displayBasicInfo(result.data);
    }

    for (const skippedDependency of skipped) {
      console.log(
        `${skippedDependency.name}: ${warning(
          `Skipped unsupported specifier "${skippedDependency.spec}"`
        )}`
      );
    }

    // Display summary
    const summary = [
      `${success(String(successCount))} packages analyzed`,
      `${error(String(failCount))} failed`,
      `${warning(String(skipped.length))} skipped`,
    ].join(", ");

    if (failCount > 0) {
      spinner.fail(summary);
    } else {
      spinner.succeed(summary);
    }

    console.log(
      `Total size: ${formatSize(totalSize)} minified, ${formatSize(
        gzipSize
      )} gzipped`
    );

    if (failCount > 0) {
      throw new Error(`${failCount} dependencies could not be analyzed`);
    }
  } catch (err) {
    if (spinner.isSpinning) {
      spinner.fail(
        `Error reading package.json: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    throw err;
  }
}
