# 📦 Bundlephobia Tool

[![npm version](https://img.shields.io/npm/v/bundlephobia-tool.svg)](https://www.npmjs.com/package/bundlephobia-tool)
[![npm downloads](https://img.shields.io/npm/dm/bundlephobia-tool.svg)](https://www.npmjs.com/package/bundlephobia-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by Bun](https://img.shields.io/badge/powered%20by-Bun-orange)](https://bun.sh)

A lightning-fast CLI tool to analyze npm package sizes using the Bundlephobia API. Make informed decisions about your dependencies by understanding their impact on your bundle size.

> **Save bandwidth, improve performance, and keep your bundles lean** 🚀

<div align="center">
  <p><i>Know your dependencies, optimize your bundles</i></p>
</div>

## ✨ Features

- 🚀 **Fast**: Powered by Bun's runtime for lightning-fast performance
- 📊 **Comprehensive**: Analyze size, dependencies, history, and more
- 🔍 **Detailed**: Get minified and gzipped sizes with visual indicators
- 📦 **Dependencies**: Scan your project's package.json to analyze all dependencies
- 🌐 **Convenient**: Open packages directly in your browser for more details
- 🎨 **Beautiful**: Color-coded output for better visualization
- 📱 **Simple API**: Intuitive commands make it easy to use
- 🔄 **Resilient**: Automatic retry logic with 10s timeout and exponential backoff

## 📋 Prerequisites

- Node.js 18+ or Bun 1.0+
- Internet connection (for API access)

## 🔧 Installation

```bash
# Install globally
npm install -g bundlephobia-tool

# Or with Bun
bun install -g bundlephobia-tool
```

## 🚀 Quick Start

```bash
# Analyze a package
pkg-size analyze react

# Check your project dependencies
pkg-size deps

# Open a package in the browser
pkg-size open lodash
```

## 🎯 Real-World Examples

Compare popular packages to find lighter alternatives:

```bash
# React vs Preact
pkg-size analyze react         # 45.7 kB gzipped
pkg-size analyze preact        # 4.3 kB gzipped (10x smaller!)

# Moment vs date-fns
pkg-size analyze moment        # 72.4 kB gzipped
pkg-size analyze date-fns      # 12.2 kB gzipped (6x smaller!)

# Lodash vs es-toolkit
pkg-size analyze lodash        # 69.9 kB gzipped
pkg-size analyze es-toolkit    # 14.7 kB gzipped (5x smaller!)
```

**Pro tip**: Always check package size before adding a new dependency!

## 📊 Usage Examples

### Analyze a single package

```bash
pkg-size analyze react
```

Output:
```
react v18.2.0
• 143.3 kB minified
• 45.7 kB gzipped
• 3 dependencies
```

### Get detailed package information

```bash
pkg-size analyze lodash --info
```

Output:
```
lodash v4.17.21

A modern JavaScript utility library delivering modularity, performance, & extras.

• License: MIT
• Downloads: 81,546,121 (last 30 days)
• Used by: 128,934 packages
• Dependencies: 0
• Keywords: modules, stdlib, util, ...
• Maintainers: jdalton, mathias, phated
```

### Show version history

```bash
pkg-size analyze react --history
```

Output:
```
react version history:

• v18.2.0
  Minified: 143.3 kB
  Gzipped: 45.7 kB

• v18.1.0
  Minified: 142.8 kB
  Gzipped: 45.4 kB

• v18.0.0
  Minified: 142.1 kB
  Gzipped: 45.1 kB
  
...
```

### Analyze dependencies

```bash
pkg-size analyze react --dependencies
```

Output:
```
react dependencies:

• loose-envify - 3.1 kB
• object-assign - 2.1 kB
• prop-types - 15.8 kB
```

### View similar packages

```bash
pkg-size analyze react --similar
```

Output:
```
Similar packages:

• preact v10.13.2
  A fast 3kB alternative to React with the same modern API
  Size: 11.3 kB minified, 4.3 kB gzipped

• inferno v7.4.11
  An extremely fast, React-like JavaScript library for building modern user interfaces
  Size: 11.3 kB minified, 4.3 kB gzipped
  
...
```

### Analyze your project dependencies

```bash
pkg-size deps
```

Output:
```
Analyzing 12 packages...

react v18.2.0
• 143.3 kB minified
• 45.7 kB gzipped

react-dom v18.2.0
• 941.1 kB minified
• 148.5 kB gzipped

...

12 packages analyzed, 0 failed
Total size: 1.3 MB minified, 230.5 kB gzipped
```

### Include devDependencies in analysis

```bash
pkg-size deps --all
```

## 📋 Command Reference

### `analyze`

Analyze a single package size.

```bash
pkg-size analyze <package> [options]
```

Options:
- `-r, --raw` - Display raw data
- `-i, --info` - Show detailed package information
- `-d, --dependencies` - Show package dependencies
- `-s, --similar` - Show similar packages
- `--history` - Show version history

### `open`

Open package in browser.

```bash
pkg-size open <package>
```

### `deps`

Analyze dependencies in package.json.

```bash
pkg-size deps [options]
```

Options:
- `-a, --all` - Include devDependencies in analysis
- `-p, --path <path>` - Path to package.json (default: ./package.json)

### General Options

- `-v, --version` - Output the current version
- `-h, --help` - Display help for command

## 🔄 How It Works

Bundlephobia tool uses the Bundlephobia API to fetch accurate package size data. The tool retrieves and displays:

- **Minified size**: The size of the package after minification
- **Gzipped size**: The size after gzip compression (what you'd actually transfer over the network)
- **Dependencies**: All dependencies of the package and their sizes
- **Version history**: Size changes across different versions
- **Similar packages**: Alternative packages that provide similar functionality

### Reliability Features

- **Timeout Protection**: All API requests timeout after 10 seconds
- **Automatic Retries**: Failed requests are retried up to 2 times with exponential backoff
- **Rate Limit Handling**: Automatically retries on 429 (rate limit) responses
- **Error Recovery**: Gracefully handles 5xx server errors with retry logic

## 💡 Why Package Size Matters

Large dependencies can significantly impact your application's:
- **Load time**: Larger bundles take longer to download
- **Parse time**: More code means more parsing time
- **Execution time**: More code generally means more execution time
- **Mobile performance**: Particularly important for users on slower connections

This tool helps you make informed decisions about which packages to include in your project.

## 🚀 Deployment

### Publishing to npm

```bash
# Build the project
bun run build

# Bump version (patch, minor, or major)
npm version patch

# Publish to npm
npm publish

# Or publish with Bun
bun publish
```

### GitHub Release

1. Push your changes and tags:
```bash
git push origin main --tags
```

2. Create a GitHub release with the new version tag

3. The package will be automatically available on npm after publishing

## 🛠️ Development

Want to contribute or run locally? Here's how to get started:

```bash
# Clone the repository
git clone https://github.com/seanwessmith/bundlephobia-tool.git
cd bundlephobia-tool

# Install dependencies
bun install

# Build the project
bun run build

# Link for local development
bun link

# Run the CLI
pkg-size analyze react
```

## 🔧 Troubleshooting

### Common Issues

**"Failed to fetch" errors**
- The tool includes automatic retry logic with exponential backoff
- Requests timeout after 10 seconds and retry up to 2 times
- Check your internet connection if errors persist

**Rate Limiting**
- Bundlephobia API may rate limit requests
- The tool automatically handles 429 responses with retry logic
- Use smaller batch sizes when analyzing many packages

**Package not found**
- Verify the package name is correct on npmjs.com
- Some packages may not be available in the Bundlephobia database
- Try specifying a version: `pkg-size analyze package@1.0.0`

**Installation issues**
- Ensure Node.js 18+ or Bun 1.0+ is installed
- Try clearing npm cache: `npm cache clean --force`
- For Bun: `bun pm cache rm`

### Reporting Issues

Found a bug? Have a feature request? Please [open an issue](https://github.com/seanwessmith/bundlephobia-tool/issues) on GitHub.

## 📝 License

MIT © [seanwessmith]