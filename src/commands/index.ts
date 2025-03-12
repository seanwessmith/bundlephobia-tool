import ora from "ora";
import open from "open";
import { promises as fs } from "fs";
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
import { error, info, success } from "../utils/colors";
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
      const info = await fetchPackageInfo(packageName);
      spinner.succeed(`Package info for ${packageName}`);
      displayDetailedInfo(info);
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
  }
}

/**
 * Open package in browser
 */
export async function openPackage(packageName: string): Promise<void> {
  const spinner = ora(`Opening ${packageName} in browser...`).start();

  try {
    await open(`https://bundlephobia.com/result?p=${packageName}`);
    spinner.succeed(`Opened ${packageName} in your default browser`);
  } catch (err) {
    spinner.fail(
      `Failed to open browser: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

/**
 * Analyze dependencies from package.json
 */
export async function analyzeDependencies(options: DepOptions): Promise<void> {
  const spinner = ora("Reading package.json...").start();

  try {
    const filePath = options.path || "./package.json";
    const fileContent = await fs.readFile(filePath, "utf-8");
    const packageData = JSON.parse(fileContent) as PackageJson;

    // Get dependencies
    const deps = {
      ...(packageData.dependencies || {}),
      ...(options.all ? packageData.devDependencies || {} : {}),
    };

    const depNames = Object.keys(deps).filter(
      (name) => !name.startsWith("@types/")
    );

    if (depNames.length === 0) {
      spinner.fail("No dependencies found in package.json");
      return;
    }

    spinner.text = `Analyzing ${depNames.length} packages...`;

    // Process dependencies in batches to avoid rate limiting
    const batchSize = 5;
    let totalSize = 0;
    let gzipSize = 0;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < depNames.length; i += batchSize) {
      const batch = depNames.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (dep) => {
          try {
            const data = await fetchPackageSize(`${dep}@${deps[dep]}`);
            return { dep, data, success: true };
          } catch (error) {
            return { dep, error, success: false };
          }
        })
      );

      // Process results
      for (const result of results) {
        if (result.success && result.data) {
          displayBasicInfo(result.data);
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
        depNames.length
      } packages...`;
    }

    // Display summary
    spinner.succeed(
      `${success(String(successCount))} packages analyzed, ${error(
        String(failCount)
      )} failed`
    );
    console.log(
      `Total size: ${formatSize(totalSize)} minified, ${formatSize(
        gzipSize
      )} gzipped`
    );
  } catch (err) {
    spinner.fail(
      `Error reading package.json: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
