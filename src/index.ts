#!/usr/bin/env node

import ora, { Ora } from "ora";
import pc from "picocolors";
import controller from "./controller.ts";
import { promises as fs } from "fs"; // Import fs to read package.json
import { basic, PackageJson } from "./callbacks.ts";
import pkg from "../package.json";

const args = process.argv.slice(2); // Get all arguments after the script name

(async () => {
  let spinner: Ora;

  // Default values
  const inputs = args.filter((arg) => !arg.startsWith("-"));
  const flags = args.filter((arg) => arg.startsWith("-"));

  // Parse command-line arguments
  if (!inputs.length && !flags.length) {
    spinner = ora().start();
    // No arguments provided
    spinner.info(
      "bundlephobia-tool" +
        "\nbp open " +
        pc.gray("view package size of latest open version") +
        "\nbp colors --info " +
        pc.gray("fetch information about the colors package") +
        "\nbp orb --dependencies " +
        pc.gray("list all dependencies of the orb package") +
        "\nbp --package.json " +
        pc.gray("view sizes of all dependencies listed in package.json") +
        "\nbp --package.json --all" +
        pc.gray("view sizes of all packages listed in package.json") +
        "\nbp --version " +
        pc.gray("view the current version of the tool")
    );
    process.exit(0);
  }

  if (flags.includes("--version") || flags.includes("-v")) {
    console.log(pc.gray(pkg.version));
    process.exit(0);
  }
  if (flags.includes("--package.json") || flags.includes("-j")) {
    spinner = ora(`starting service`).start();
    try {
      // Read package.json file
      const packageJsonContent = await fs.readFile("package.json", "utf-8");
      const packageData = JSON.parse(packageJsonContent) as PackageJson;
      // Get list of dependencies
      const dependencies: string[] = [];
      const rawDependencies = flags.includes("--all")
        ? [
            ...Object.keys(packageData.dependencies || {}),
            ...Object.keys(packageData.devDependencies || {}),
          ]
        : Object.keys(packageData.dependencies || {}).filter(
            (dep) => !dep.startsWith("@types")
          );
      console.log(rawDependencies);
      dependencies.push(
        ...rawDependencies.filter((dep) => !dep.startsWith("@types"))
      );
      if (dependencies.length === 0) {
        return spinner.fail("No dependencies found in package.json");
      }
      spinner.text = `Fetching data for ${dependencies.length} packages in package.json`;
      // Fetch data for all dependencies concurrently
      const results = await Promise.all(
        dependencies.map(async (dep) => {
          const res = await fetch(
            `https://bundlephobia.com/api/size?package=${dep}`
          );
          if (!res.ok) {
            return { dep, error: true };
          }
          const data = await res.json();
          return { dep, data };
        })
      );
      spinner.succeed("Fetched data for packages in package.json");
      // Process results
      results.forEach((result) => {
        if (result.error) {
          console.log(`${result.dep}: Failed to fetch data`);
        } else {
          basic(spinner, result.data);
        }
      });
    } catch (err) {
      spinner.fail("Failed to read package.json");
      process.exit(1);
    }
    return;
  }

  spinner = ora(`starting service`).start();

  // If no input is provided, but there's a flag
  if (!inputs.length) {
    spinner.fail("No package name provided");
    process.exit(1);
  }

  for (const input of inputs) {
    const command = controller(input, flags[0]);
    if (!command) return spinner.fail(`failed to resolve passed flag`);
    spinner.text = command.request;

    const result = await fetch(command.endpoint);
    if (!result.ok) return spinner.fail(command.failed);
    command.callback(spinner, await result.json(), input);
  }
})();
