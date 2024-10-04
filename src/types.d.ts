declare module "resolve-package-json" {
  export function resolver(
    pkg: Record<string, unknown>,
    callback: (
      err: string,
      result: {
        dependencies: Record<string, { version: string }>;
      }
    ) => void
  ): void;
}

global {
  export namespace BpTool {
    interface Asset {
      gzip: number;
      name: string;
      size: number;
      type: string;
    }

    interface DependencySize {
      approximateSize: number;
      name: string;
    }

    interface PackageInfo {
      assets: Asset[];
      dependencyCount: number;
      dependencySizes: DependencySize[];
      description: string;
      gzip: number;
      hasJSModule: boolean;
      hasJSNext: boolean;
      hasSideEffects: boolean;
      isModuleType: boolean;
      name: string;
      repository: string;
      scoped: boolean;
      size: number;
      version: string;
    }
  }
}
export {};