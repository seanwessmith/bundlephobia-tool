import { describe, expect, it } from "bun:test";
import {
  normalizePackageHistory,
  normalizeSimilarPackageNames,
} from "./bundlephobia";

describe("normalizeSimilarPackageNames", () => {
  it("returns package names from the Bundlephobia similar packages response", () => {
    const names = normalizeSimilarPackageNames({
      category: {
        similar: ["react-spring", "framer-motion", "react-motion"],
      },
    });

    expect(names).toEqual([
      "react-spring",
      "framer-motion",
      "react-motion",
    ]);
  });

  it("returns an empty array for invalid responses", () => {
    expect(normalizeSimilarPackageNames({})).toEqual([]);
  });
});

describe("normalizePackageHistory", () => {
  it("keeps only analyzed versions and preserves version numbers", () => {
    const history = normalizePackageHistory({
      "19.2.4": {
        size: 7595,
        gzip: 2927,
      },
      "19.2.3": {
        size: 7595,
        gzip: 2910,
      },
      "0.0.2": {},
    });

    expect(history).toEqual([
      {
        version: "19.2.4",
        size: 7595,
        gzip: 2927,
      },
      {
        version: "19.2.3",
        size: 7595,
        gzip: 2910,
      },
    ]);
  });

  it("limits the history output to the most recent analyzed versions", () => {
    const source = Object.fromEntries(
      Array.from({ length: 15 }, (_, index) => {
        const version = `1.0.${index}`;

        return [
          version,
          {
            size: index + 1,
            gzip: index + 1,
          },
        ];
      })
    );

    const history = normalizePackageHistory(source);

    expect(history).toHaveLength(12);
    expect(history[0]?.version).toBe("1.0.14");
    expect(history.at(-1)?.version).toBe("1.0.3");
  });
});
