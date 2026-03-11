const PACKAGE_SPEC_PATTERN = /^(?:@[^/]+\/)?[^@]+(?:@.+)?$/;

export interface ParsedPackageSpecifier {
  name: string;
  version?: string;
}

export interface DependencyRequest {
  packageName: string;
  request: string;
}

export function parsePackageSpecifier(specifier: string): ParsedPackageSpecifier {
  const trimmed = specifier.trim();
  const versionSeparator = trimmed.lastIndexOf("@");

  if (trimmed.startsWith("@")) {
    const scopeSeparator = trimmed.indexOf("/");

    if (versionSeparator > scopeSeparator) {
      return {
        name: trimmed.slice(0, versionSeparator),
        version: trimmed.slice(versionSeparator + 1),
      };
    }

    return { name: trimmed };
  }

  if (versionSeparator > 0) {
    return {
      name: trimmed.slice(0, versionSeparator),
      version: trimmed.slice(versionSeparator + 1),
    };
  }

  return { name: trimmed };
}

export function isLikelyPackageSpecifier(value: string): boolean {
  return PACKAGE_SPEC_PATTERN.test(value.trim());
}

export function buildDependencyRequest(
  dependencyName: string,
  dependencySpec: string
): DependencyRequest | null {
  const spec = dependencySpec.trim();

  if (!spec || spec === "*" || spec === "latest") {
    return {
      packageName: dependencyName,
      request: dependencyName,
    };
  }

  if (spec.startsWith("npm:")) {
    const aliasTarget = spec.slice(4).trim();

    if (!aliasTarget || !isLikelyPackageSpecifier(aliasTarget)) {
      return null;
    }

    return {
      packageName: dependencyName,
      request: aliasTarget,
    };
  }

  if (
    spec.startsWith("workspace:") ||
    spec.startsWith("file:") ||
    spec.startsWith("link:") ||
    spec.startsWith("portal:") ||
    spec.startsWith("patch:") ||
    spec.startsWith("git:") ||
    spec.startsWith("git+")) {
    return null;
  }

  if (
    spec.startsWith("github:") ||
    spec.startsWith("http:") ||
    spec.startsWith("https:")) {
    return null;
  }

  return {
    packageName: dependencyName,
    request: `${dependencyName}@${spec}`,
  };
}
