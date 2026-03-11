# Bundlephobia Tool

[![npm version](https://img.shields.io/npm/v/bundlephobia-tool.svg)](https://www.npmjs.com/package/bundlephobia-tool)
[![npm downloads](https://img.shields.io/npm/dm/bundlephobia-tool.svg)](https://www.npmjs.com/package/bundlephobia-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`bundlephobia-tool` is a CLI for checking npm package bundle size, gzip size, dependency weight, version history, and similar packages from the terminal.

If you have ever searched for:

- `bundlephobia cli`
- `npm package size checker`
- `how to check bundle size of a package from terminal`
- `analyze package.json dependencies by size`

this is the tool for that job.

## Why This Exists

[Bundlephobia](https://bundlephobia.com) is excellent, but opening a browser tab for every package breaks flow. This CLI keeps the same idea inside the terminal so you can evaluate dependencies while coding, reviewing a pull request, or guiding an AI agent through a repo.

It is useful for:

- Frontend engineers comparing packages before adding a dependency
- Library maintainers watching bundle cost over time
- PR reviewers looking for unexpectedly heavy packages
- CI scripts that should fail when analysis fails
- LLM and agent workflows that need a simple terminal-native package size check

## What It Does

- Analyze a single npm package with minified and gzipped size
- Show richer package metadata like license, downloads, homepage, and repository
- List similar packages using Bundlephobia's recommendations
- Show recent analyzed version history for a package
- Scan a local `package.json` and rank dependencies by size
- Retry transient API failures and use safer batching to reduce rate limits

## Installation

Runtime support:

- Node.js 20+
- Bun 1+

Install globally:

```bash
npm install -g bundlephobia-tool
```

or:

```bash
bun install -g bundlephobia-tool
```

Or run it without installing:

```bash
npx bundlephobia-tool analyze react
```

The installed command is:

```bash
pkg-size
```

## Quick Start

Check one package:

```bash
pkg-size analyze react
```

Show more package details:

```bash
pkg-size analyze react --info
```

See similar packages:

```bash
pkg-size analyze react --similar
```

Inspect recent version history:

```bash
pkg-size analyze react --history
```

Analyze dependencies in the current project:

```bash
pkg-size deps
```

Include `devDependencies` too:

```bash
pkg-size deps --all
```

## Command Reference

### `pkg-size analyze <package>`

Analyze a single npm package. Works with package names, exact versions, and semver ranges that Bundlephobia understands.

Examples:

```bash
pkg-size analyze react
pkg-size analyze react@19.2.0
pkg-size analyze commander@^14.0.2
```

Options:

- `-r, --raw`: print the raw Bundlephobia size response as JSON
- `-i, --info`: show package metadata plus bundle size
- `-d, --dependencies`: show the package's dependency size breakdown
- `-s, --similar`: show similar packages and size data when available
- `--history`: show recent analyzed versions from Bundlephobia

### `pkg-size open <package>`

Open the package's Bundlephobia result page in your default browser.

```bash
pkg-size open react
```

### `pkg-size deps`

Analyze the dependencies in a `package.json` file and print the heaviest packages first.

Examples:

```bash
pkg-size deps
pkg-size deps --all
pkg-size deps --path ./apps/web/package.json
pkg-size deps --path ./apps/web
```

Options:

- `-a, --all`: include `devDependencies`
- `-p, --path <path>`: path to a `package.json` file or a directory containing one

Notes:

- `@types/*` packages are skipped automatically
- `workspace:`, `file:`, `link:`, `portal:`, `patch:`, `git:`, `git+`, `github:`, and URL-based dependencies are skipped because they cannot be analyzed reliably through Bundlephobia
- `npm:` aliases are supported

## Example Output

Single package:

```text
$ pkg-size analyze react

react v19.2.4
• 7.4 kB minified
• 2.9 kB gzipped
```

Detailed package info:

```text
$ pkg-size analyze react --info

react v19.2.4

React is a JavaScript library for building user interfaces.

• Bundle size: 7.4 kB minified, 2.9 kB gzipped
• License: MIT
• Downloads: 360,786,955 (last 30 days)
• Homepage: https://react.dev/
• Repository: https://github.com/facebook/react
```

Dependency scan:

```text
$ pkg-size deps

react-dom v19.2.0
• 16.1 kB minified
• 5.2 kB gzipped

react v19.2.4
• 7.4 kB minified
• 2.9 kB gzipped

✔ 2 packages analyzed, 0 failed, 0 skipped
Total size: 23.5 kB minified, 8.1 kB gzipped
```

Actual package versions and sizes change over time. The commands above are the stable part.

## Common Questions

### How do I check npm package size from the terminal?

Use:

```bash
pkg-size analyze <package-name>
```

Example:

```bash
pkg-size analyze lodash
```

### How do I compare the weight of dependencies in my project?

Run:

```bash
pkg-size deps
```

This reads your local `package.json`, queries Bundlephobia for each supported dependency, and prints the largest dependencies first.

### Can I use this in CI?

Yes. Commands now exit with a non-zero status when analysis fails, which makes the tool usable in scripts and automation.

### Can LLMs or coding agents use this?

Yes. The CLI is intentionally simple:

- one package: `pkg-size analyze react`
- project dependencies: `pkg-size deps`
- similar alternatives: `pkg-size analyze react --similar`
- browser fallback: `pkg-size open react`

That makes it easy for an LLM agent to answer prompts like:

- `Find the heaviest dependency in this repo`
- `Check whether this new package is lightweight`
- `Suggest smaller alternatives to this dependency`

## Data Sources

The tool uses:

- Bundlephobia for package size, dependency breakdowns, similar packages, and package history
- npm registry APIs for package metadata and 30-day download counts

An internet connection is required.

## Reliability

- Retries transient failures
- Uses timeouts for network calls
- Batches dependency analysis conservatively to avoid API rate limits
- Falls back gracefully when some similar-package lookups do not return size metadata

## Development

Install dependencies:

```bash
bun install
```

Run locally:

```bash
bun run src/cli.ts analyze react
```

Build the distributable:

```bash
bun run build
```

Run tests:

```bash
bun test
```

## Contributing

Issues and pull requests are welcome.

If you want to improve package discovery, output formats, or CI integration, open an issue with a concrete use case.

## License

MIT
