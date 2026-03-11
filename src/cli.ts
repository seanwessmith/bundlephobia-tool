#!/usr/bin/env node
import { Command } from "commander";
import { version } from "../package.json";
import { analyze, analyzeDependencies, openPackage } from "./commands";

const program = new Command();

// Set program information
program
  .name("pkg-size")
  .description("Analyze npm package sizes using bundlephobia")
  .version(version, "-v, --version", "Output the current version");

// Single package analysis
program
  .command("analyze")
  .description("Analyze a single package size")
  .argument(
    "<package>",
    "Package name to analyze (e.g., react, lodash@4.17.21)"
  )
  .option("-r, --raw", "Display raw data")
  .option("-i, --info", "Show detailed package information")
  .option("-d, --dependencies", "Show package dependencies")
  .option("-s, --similar", "Show similar packages")
  .option("--history", "Show version history")
  .action(async (pkg, options) => {
    await analyze(pkg, options);
  });

// Open in browser
program
  .command("open")
  .description("Open package in browser")
  .argument("<package>", "Package name to open in browser")
  .action(async (pkg) => {
    await openPackage(pkg);
  });

// Package.json analysis
program
  .command("deps")
  .description("Analyze dependencies in package.json")
  .option("-a, --all", "Include devDependencies in analysis")
  .option("-p, --path <path>", "Path to package.json", "./package.json")
  .action(async (options) => {
    await analyzeDependencies(options);
  });

async function main(): Promise<void> {
  if (process.argv.length <= 2) {
    program.outputHelp();
    return;
  }

  await program.parseAsync(process.argv);
}

await main().catch(() => {
  process.exitCode = 1;
});
