#!/usr/bin/env node

import ora from "ora";
import pc from "picocolors";
import controller from "./controller.ts";
import { promises as fs } from "fs"; // Import fs to read package.json
import { basic } from "./callbacks.ts";

const args = process.argv.slice(2); // Get all arguments after the script name

(async () => {
  const spinner = ora(`starting service`).start();

  // Default values
  let input = null;
  let flag = null;

  // Parse command-line arguments
  if (args.length === 0) {
    // No arguments provided
    spinner.info(
      "bundlephobia-cli" +
        "\nbp open " +
        pc.gray("view package size of latest open version") +
        "\nbp colors --info " +
        pc.gray("fetch information about the colors package") +
        "\nbp orb --dependencies " +
        pc.gray("list all dependencies of the orb package") +
        "\nbp --package.json " +
        pc.gray("view sizes of all packages in package.json")
    );
    process.exit(0);
  } else if (args.length === 1) {
    // Only one argument provided
    if (args[0].startsWith("--") || args[0].startsWith("-")) {
      flag = args[0];
    } else {
      input = args[0];
    }
  } else {
    // Two or more arguments provided
    input = args[0];
    flag = args[1];
  }

  // Handle the --package.json flag when it's in the input variable
  if (
    (flag === "--package.json" || flag === "-j") ||
    (input === "--package.json" || input === "-j")
  ) {
    try {
      // Read package.json file
      const packageJsonContent = await fs.readFile("package.json", "utf-8");
      const packageData = JSON.parse(packageJsonContent);
      // Get list of dependencies
      const dependencies = Object.keys(packageData.dependencies || {});
      if (dependencies.length === 0) {
        return spinner.fail("No dependencies found in package.json");
      }
      spinner.text = "Fetching data for packages in package.json";
      // Fetch data for all dependencies concurrently
      const results = await Promise.all(
        dependencies.map(async (dep) => {
          const endpoint = `https://bundlephobia.com/api/size?package=${dep}`;
          const res = await fetch(endpoint);
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

  // If no input is provided, but there's a flag
  if (!input) {
    spinner.fail("No package name provided");
    process.exit(1);
  }

  const command = controller(input, flag);
  if (!command) return spinner.fail(`failed to resolve passed flag`);
  spinner.text = command.request;

  const result = await fetch(command.endpoint);
  if (!result.ok) return spinner.fail(command.failed);
  command.callback(spinner, await result.json(), input);
})();