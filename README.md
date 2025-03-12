# 📦 Bundlephobia Tool

[![npm version](https://img.shields.io/npm/v/package-size-analyzer.svg)](https://www.npmjs.com/package/package-size-analyzer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by Bun](https://img.shields.io/badge/powered%20by-Bun-orange)](https://bun.sh)

A lightning-fast CLI tool to analyze npm package sizes using the Bundlephobia API. Make informed decisions about your dependencies by understanding their impact on your bundle size.

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

## 🔧 Installation

```bash
# Install globally
npm install -g package-size-analyzer

# Or with Bun
bun install -g package-size-analyzer
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
- `-h, --history` - Show version history

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

## 💡 Why Package Size Matters

Large dependencies can significantly impact your application's:
- **Load time**: Larger bundles take longer to download
- **Parse time**: More code means more parsing time
- **Execution time**: More code generally means more execution time
- **Mobile performance**: Particularly important for users on slower connections

This tool helps you make informed decisions about which packages to include in your project.

## 🛠️ Development

Want to contribute or run locally? Here's how to get started:

```bash
# Clone the repository
git clone https://github.com/yourusername/package-size-analyzer.git
cd package-size-analyzer

# Install dependencies
bun install

# Build the project
bun run build

# Link for local development
bun link

# Run the CLI
pkg-size analyze react
```

## 📝 License

MIT © [seanwessmith]