# 📦 Bundlephobia Tool

[![npm version](https://img.shields.io/npm/v/bundlephobia-tool.svg)](https://www.npmjs.com/package/bundlephobia-tool)
[![npm downloads](https://img.shields.io/npm/dm/bundlephobia-tool.svg)](https://www.npmjs.com/package/bundlephobia-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by Bun](https://img.shields.io/badge/powered%20by-Bun-orange)](https://bun.sh)

A lightning-fast CLI tool to analyze npm package sizes using the Bundlephobia API. Make informed decisions about your dependencies by understanding their impact on your bundle size.

> **Save bandwidth, improve performance, and keep your bundles lean** 🚀

<div align="center">
  <p><i>Know your dependencies, optimize your bundles</i></p>
  <br>
  <img src="https://via.placeholder.com/600x400?text=Demo+GIF+Placeholder" alt="Bundlephobia Tool Demo" width="600">
  <br>
</div>

## 📑 Table of Contents

- [Features](#-features)
- [Why use this?](#-why-use-this)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Examples](#-examples)
- [Command Reference](#-command-reference)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 📊 **Comprehensive**: Analyze size, dependencies, history, and more
- 📦 **Dependencies**: Scan your project's package.json to analyze all dependencies
- 🌐 **Convenient**: Open packages directly in your browser for more details
- ⚡ **Fast**: Built with Bun for lightning-fast performance
- 🛡️ **Reliable**: Automatic retry logic for API stability

## 💡 Why use this?

While [bundlephobia.com](https://bundlephobia.com) is amazing, switching context to a browser can break your flow. **bundlephobia-tool** brings that power directly to your terminal.

- **Stay in the Terminal**: Check sizes without leaving your code.
- **CI/CD Integration**: Use it in your build pipelines to prevent bloat.
- **Local Analysis**: Scan your `package.json` to find the heaviest dependencies in your specific project.
- **Version Comparison**: Easily compare different versions to see if an upgrade is worth the weight.
- **Performance Matters**: Keep bundles lean to improve load time, execution speed, and mobile experience.

## 📋 Prerequisites

- Node.js 18+

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

## 📊 Examples

### Analyze a single package
```bash
pkg-size analyze react
```
<details>
<summary>View Output</summary>

```
react v18.2.0
• 143.3 kB minified
• 45.7 kB gzipped
• 3 dependencies
```
</details>

### Get detailed package information
```bash
pkg-size analyze lodash --info
```
<details>
<summary>View Output</summary>

```
lodash v4.17.21
A modern JavaScript utility library delivering modularity, performance, & extras.
• License: MIT
• Downloads: 81,546,121 (last 30 days)
...
```
</details>

### Show version history
```bash
pkg-size analyze react --history
```
<details>
<summary>View Output</summary>

```
react version history:
• v18.2.0 - Minified: 143.3 kB, Gzipped: 45.7 kB
• v18.1.0 - Minified: 142.8 kB, Gzipped: 45.4 kB
...
```
</details>

### Analyze dependencies
```bash
pkg-size analyze react --dependencies
```
<details>
<summary>View Output</summary>

```
react dependencies:
• loose-envify - 3.1 kB
• object-assign - 2.1 kB
• prop-types - 15.8 kB
```
</details>

### View similar packages
```bash
pkg-size analyze react --similar
```
<details>
<summary>View Output</summary>

```
Similar packages:
• preact v10.13.2 (Size: 11.3 kB minified, 4.3 kB gzipped)
• inferno v7.4.11 (Size: 11.3 kB minified, 4.3 kB gzipped)
...
```
</details>

### Analyze your project dependencies
```bash
pkg-size deps
```
<details>
<summary>View Output</summary>

```
Analyzing 12 packages...
react v18.2.0 • 143.3 kB minified • 45.7 kB gzipped
react-dom v18.2.0 • 941.1 kB minified • 148.5 kB gzipped
...
Total size: 1.3 MB minified, 230.5 kB gzipped
```
</details>

### Include devDependencies in analysis
```bash
pkg-size deps --all
```

## 📋 Command Reference

| Command | Usage | Description |
|---------|-------|-------------|
| `analyze` | `pkg-size analyze <package> [options]` | Analyze a single package size. Options: `-r` (raw), `-i` (info), `-d` (deps), `-s` (similar), `--history`. |
| `open` | `pkg-size open <package>` | Open package in browser. |
| `deps` | `pkg-size deps [options]` | Analyze dependencies in `package.json`. Options: `-a` (include devDeps), `-p <path>`. |

**General Options**: `-v, --version`, `-h, --help`

## 🔧 Troubleshooting

- **"Failed to fetch"**: The tool automatically retries. Check your internet if it persists.
- **Rate Limiting**: We handle 429s automatically. Try smaller batches if issues continue.
- **Package not found**: Check spelling or try specifying a version (e.g., `package@1.0.0`).
- **Installation**: Requires Node.js 18+. Try `npm cache clean --force` if stuck.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT © [seanwessmith]