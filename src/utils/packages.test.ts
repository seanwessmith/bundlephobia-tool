import { describe, expect, it } from "bun:test";
import {
  buildDependencyRequest,
  parsePackageSpecifier,
} from "./packages";

describe("parsePackageSpecifier", () => {
  it("parses unscoped packages with versions", () => {
    expect(parsePackageSpecifier("react@19.2.0")).toEqual({
      name: "react",
      version: "19.2.0",
    });
  });

  it("parses scoped packages with versions", () => {
    expect(parsePackageSpecifier("@types/react@19.0.1")).toEqual({
      name: "@types/react",
      version: "19.0.1",
    });
  });

  it("keeps package names without versions intact", () => {
    expect(parsePackageSpecifier("@babel/core")).toEqual({
      name: "@babel/core",
    });
  });
});

describe("buildDependencyRequest", () => {
  it("keeps semver ranges for Bundlephobia requests", () => {
    expect(buildDependencyRequest("commander", "^14.0.2")).toEqual({
      packageName: "commander",
      request: "commander@^14.0.2",
    });
  });

  it("converts npm aliases into the real package request", () => {
    expect(buildDependencyRequest("cli", "npm:commander@^14.0.2")).toEqual({
      packageName: "cli",
      request: "commander@^14.0.2",
    });
  });

  it("skips workspace dependencies that cannot be analyzed remotely", () => {
    expect(buildDependencyRequest("@acme/ui", "workspace:*")).toBeNull();
  });
});
