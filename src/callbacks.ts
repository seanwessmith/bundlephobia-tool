import type { Ora } from "ora";
import pc from "picocolors";
import colors from "picocolors";

interface Size {
  kb: string;
  mb: string;
}

const convert = (size: number) => ({
  kb: calculate(size, 1),
  mb: calculate(size, 2),
});

export interface PackageJson {
  name: string;
  version: number;
  description: string;
  dependents: number;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>[];
  types: Record<string, string>;
  license: string;
  keywords: string[];
  deprecated: boolean;
  popular: boolean;
  humanDownloadsLast30Days: number;
  lastCrawl: string;
  owners: Array<{ name: string }>;
  dependencyCount: number;
  dependencySizes: Array<{ name: string; approximateSize: number }>;
}

const sizeUnit = (size: Size) =>
  parseFloat(size.mb) >= 1 ? size.mb + " MB" : size.kb + " kB";

const sizeColor = (size: string, output: string) => {
  const float = parseFloat(size);
  return float < 0.5
    ? colors.green(output)
    : float >= 1
    ? colors.red(output)
    : colors.yellow(output);
};

const calculate = (value: number, pow: number) =>
  (value / Math.pow(1024, pow)).toFixed(1);

const raw = (spinner: Ora, pkg: PackageJson) => {
  spinner.succeed(pc.gray(`${pkg.name}` + `@${pkg.version}`));
  console.log(pkg);
};

const basic = (
  spinner: Ora,
  pkg: { name: string; version: number; gzip: number; size: number }
) => {
  const zip = convert(pkg.gzip);
  const regular = convert(pkg.size);

  spinner.succeed(pc.gray(`${pkg.name}` + `@${pkg.version}`));

  console.log(
    `\t${pc.yellow('•')} ${sizeColor(regular.mb, sizeUnit(regular))} ` +
      pc.gray("minified") +
      `\n\t${pc.yellow('•')} ${sizeColor(zip.mb, sizeUnit(zip))} ` +
      pc.gray("gzipped")
  );
};

const browser = (spinner: Ora, pkg: PackageJson) => {
  open(`https://bundlephobia.com/result?p=${pkg.name}`);

  spinner.succeed(
    pc.gray(`opened ${pkg.name}` + `@${pkg.version}`) +
      " in your default browser"
  );
};

const similar = (
  spinner: Ora,
  pkg: { name: string; version: number; category: { similar: PackageJson[] } }
) => {
  const pkgs = pkg.category.similar;
  const count = pkgs.length;

  if (count > 0) {
    spinner.succeed(
      pkg.name + pc.gray(` ${count} similar pkg${count > 1 && "s"}`)
    );

    pkgs.forEach((pkg) => {
      console.log(pkg);
    });
  } else {
    spinner.fail("could not find any similar pkgs");
  }
};

const info = (spinner: Ora, pkg: PackageJson) => {
  spinner.succeed(`${pkg.name}` + pc.gray(`@${pkg.version}`));

  console.log({
    project: pkg.name,
    version: pkg.version,
    description: pkg.description,
    dependents: pkg.dependents,
    dependencies: Object.keys(pkg.dependencies).length,
    devDepends: Object.keys(pkg.devDependencies).length,
    types: Object.values(pkg.types).toString(),
    license: pkg.license,
    keywords:
      pkg.keywords.length > 5
        ? pkg.keywords.slice(0, 5).toString() + ", ..."
        : pkg.keywords.toString(),
    deprecated: pkg.deprecated,
    popular: pkg.popular,
    downloads: pkg.humanDownloadsLast30Days,
    crawled: pkg.lastCrawl,
    authors: pkg.owners.map((owner) => owner.name).join(),
  });
};

const history = (spinner: Ora, pkg: PackageJson, input: string) => {
  const history = Object.values(pkg);
  const count = history.length;

  spinner.succeed(input + pc.gray(` ${count} version${count > 1 && "s"}`));

  history.forEach((version) => {
    if (Object.keys(version).length > 0) {
      const zip = convert(version.gzip);
      const regular = convert(version.size);

      console.log(
        `\n${input}` +
          pc.gray(
            `@${version.version}\n${sizeColor(regular.mb, sizeUnit(regular))}`
          ) +
          pc.gray(" minified") +
          `\n${sizeColor(zip.mb, sizeUnit(zip))}` +
          pc.gray(" gzipped")
      );
    }
  });
};

const dependencies = (spinner: Ora, pkg: PackageJson) => {
  spinner.succeed(`${pkg.name}` + pc.gray(`@${pkg.version}`));

  if (pkg.dependencyCount === 0)
    return console.log("could not find any dependencies");

  pkg.dependencySizes.forEach((dependency) => {
    const size = convert(dependency.approximateSize);

    console.log(`${dependency.name}: ${sizeColor(size.mb, sizeUnit(size))}`);
  });
};

const peers = (spinner: Ora, pkg: PackageJson) => {
  spinner.succeed(`${pkg.name}` + pc.gray(`@${pkg.version}`));

  if (!pkg.peerDependencies) return console.log("could not find any peers");
  pkg.peerDependencies.forEach((peer) => console.log(peer));
};

export {
  raw,
  info,
  basic,
  peers,
  browser,
  similar,
  history,
  dependencies,
};
