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
