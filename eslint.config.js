import { defineConfig } from "eslint-define-config";

export default defineConfig({
  root: true,
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser for TypeScript
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  env: {
    node: true, // Defines Node.js global variables and Node.js scoping
    es6: true, // Enables ES6 globals
  },
  extends: [
    "eslint:recommended", // Uses the recommended rules from ESLint
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "prettier", // Disables ESLint rules that might conflict with Prettier
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    // Customize your rules here
    "no-unused-vars": "off", // Turn off the base rule as it's covered by TypeScript
    "@typescript-eslint/no-unused-vars": ["error"],
    semi: ["error", "always"], // Enforce semicolons
    quotes: ["error", "single"], // Enforce single quotes
    indent: ["error", 2], // Enforce 2-space indentation
    "arrow-parens": ["error", "always"], // Always require parentheses around arrow function parameters
    // Add more custom rules as needed
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"], // Apply these settings to TypeScript files
      rules: {
        // TypeScript specific rules can be added here
      },
    },
  ],
});
