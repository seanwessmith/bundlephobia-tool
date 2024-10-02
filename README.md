# BundlePhobia Tool

![BundlePhobia Tool](https://img.shields.io/badge/BundlePhobia-Tool-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-14%2B-green)

BundlePhobia Tool is a powerful command-line tool that interacts with [BundlePhobia](https://bundlephobia.com/) APIs to help you analyze the size and dependencies of your npm packages directly from your terminal. Whether you're looking to check the size of a specific package, explore its dependencies, or analyze all dependencies listed in your `package.json`, BundlePhobia Tool has you covered.

## Table of Contents

- [BundlePhobia Tool](#bundlephobia-tool)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic Commands](#basic-commands)
    - [Flags](#flags)
    - [Examples](#examples)
    - [Help](#help)
  - [API Endpoints](#api-endpoints)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- **Check Package Size:** Quickly view the minified and gzipped sizes of any npm package.
- **View Package Information:** Fetch detailed information about a package, including dependencies, version history, and more.
- **List Dependencies:** Retrieve a list of all dependencies for a specific package.
- **Analyze `package.json`:** View sizes of all dependencies listed in your project's `package.json`.
- **Search Similar Packages:** Discover packages similar to the one you're interested in.
- **Open in Browser:** Easily open the package details on BundlePhobia's website.

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed (version 14 or higher).

Install BundlePhobia Tool globally using npm or yarn:

```bash
# Using npm
npm install -g bundlephobia-tool

# Using yarn
yarn global add bundlephobia-tool
```

> **Note:** You might need to restart your terminal or ensure that your global `node_modules` are in your system's PATH.

## Usage

BundlePhobia Tool provides various commands and flags to interact with npm packages. Below are the primary ways to use the tool.

### Basic Commands

```bash
bp <package-name> [flag]
```

- `<package-name>`: The name of the npm package you want to analyze.
- `[flag]`: Optional flags to modify the command's behavior.

### Flags

- `--info`, `-i`: Fetch detailed information about the package.
- `--dependencies`, `-d`: List all dependencies of the package.
- `--package.json`, `-j`: Analyze all dependencies listed in your `package.json`.
- `--peer`, `-p`: List peer dependencies of the package.
- `--raw`, `-r`: Output raw JSON data of the package.
- `--browse`, `-b`: Open the package details in your default browser.
- `--history`, `-h`: View the version history of the package.
- `--similar`, `-s`: Find packages similar to the specified package.

### Examples

1. **View Package Size**

   ```bash
   bp react
   ```

   **Output:**

   ```
   react@18.2.0
   • 30.5 kB minified
   • 10.2 kB gzipped
   ```

2. **Fetch Package Information**

   ```bash
   bp react --info
   ```

   **Output:**

   ```
   react@18.2.0
   {
     project: "react",
     version: 18.2.0,
     description: "React is a JavaScript library for building user interfaces.",
     dependents: 80000,
     dependencies: 3,
     devDepends: 2,
     types: "@types/react",
     license: "MIT",
     keywords: "react, ui, library, javascript",
     deprecated: false,
     popular: true,
     downloads: 5000000,
     crawled: "2024-04-01T12:34:56Z",
     authors: "Jordan Walke, Facebook"
   }
   ```

3. **List All Dependencies of a Package**

   ```bash
   bp react --dependencies
   ```

   **Output:**

   ```
   react@18.2.0
   react-dom: 25.3 kB
   scheduler: 5.1 kB
   ```
   
4. **Analyze All Dependencies in `package.json`**

   ```bash
   bp --package.json
   ```

   **Output:**

   ```
   ✔ Fetched data for packages in package.json
   ✔ inquirer@11.1.0
           • 456.2 kB minified
           • 206.0 kB gzipped
   ✔ ora@8.1.0
           • 48.7 kB minified
           • 12.4 kB gzipped
   ✔ picocolors@1.1.0
           • 0.7 kB minified
           • 0.4 kB gzipped
   ```

5. **Open Package in Browser**

   ```bash
   bp react --browse
   ```

   **Output:**

   ```
   opened react@18.2.0 in your default browser
   ```

6. **View Version History of a Package**

   ```bash
   bp react --history
   ```

   **Output:**

   ```
   react 5 versions
   react@18.0.0
   25.0 kB minified
   8.0 kB gzipped

   react@18.1.0
   25.5 kB minified
   8.1 kB gzipped

   ...
   ```

7. **Find Similar Packages**

   ```bash
   bp react --similar
   ```

   **Output:**

   ```
   react 3 similar pkgs
   preact@10.5.13
   inferno@7.4.4
   vue@3.2.31
   ```

### Help

If you need assistance or forgot the commands, simply run:

```bash
bp
```

**Output:**

```
bundlephobia-tool
bp open <package> <view package size of latest open version>
bp colors --info <fetch information about the colors package>
bp orb --dependencies <list all dependencies of the orb package>
bp --package.json <view sizes of all packages in package.json>
```

## API Endpoints

BundlePhobia Tool interacts with several BundlePhobia API endpoints to fetch the required data:

- **Basic Size:** `https://bundlephobia.com/api/size?package=<package-name>`
- **History:** `https://bundlephobia.com/api/package-history?package=<package-name>`
- **Similar Packages:** `https://bundlephobia.com/api/similar-packages?package=<package-name>`
- **Package Information:** `https://ofcncog2cu-dsn.algolia.net/1/indexes/npm-search/<package-name>?x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=YOUR_API_KEY`

> **Note:** Ensure you handle API keys securely if required.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add some feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

Please ensure your code adheres to the project's coding standards and includes relevant tests.

## License

This project is licensed under the [MIT License](LICENSE).
