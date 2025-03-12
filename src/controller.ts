import {
    raw,
    info,
    basic,
    peers,
    browser,
    similar,
    history,
    dependencies,
  } from "./callbacks";
  import type { Ora } from "ora";
  
  // Define types for better type safety
  type Callback = (spinner: Ora, data: any, input?: string) => void;
  
  interface ControllerResult {
    endpoint: string;
    callback: Callback;
    request: string;
    failed: string;
  }
  
  interface FlagConfig {
    endpoint: 'basic' | 'history' | 'website' | 'similar' | 'package';
    callback: Callback;
    request: string;
  }
  
  // Create endpoints object with proper typing
  const createEndpoint = (input: string) => {
    const endpoints = {
      basic: `https://bundlephobia.com/api/size?package=${input}`,
      history: `https://bundlephobia.com/api/package-history?package=${input}`,
      website: `https://bundlephobia.com/result?p=${input}`,
      similar: `https://bundlephobia.com/api/similar-packages?package=${input}`,
      package: `https://ofcncog2cu-dsn.algolia.net/1/indexes/npm-search/${encodeURIComponent(
        input
      )}?x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=f54e21fa3a2a0160595bb058179bfb1e`,
    };
    
    return endpoints;
  };
  
  // Define flag configurations for easier maintenance
  const flagConfigs: Record<string, FlagConfig> = {
    history: {
      endpoint: 'history',
      callback: history as Callback,
      request: 'fetching history',
    },
    similar: {
      endpoint: 'similar',
      callback: similar,
      request: 'search for similar packages',
    },
    info: {
      endpoint: 'package',
      callback: info,
      request: 'fetching package information',
    },
    raw: {
      endpoint: 'basic',
      callback: raw,
      request: 'searching for package',
    },
    dependencies: {
      endpoint: 'basic',
      callback: dependencies,
      request: 'looking up dependencies',
    },
    peer: {
      endpoint: 'basic',
      callback: peers,
      request: 'searching for peers',
    },
    browse: {
      endpoint: 'basic',
      callback: browser,
      request: 'searching for package',
    },
  };
  
  // Flag aliases with improved typing
  const FlagAliases: Record<string, string[]> = {
    info: ["--info", "-i"],
    dependencies: ["--dependencies", "-d"],
    "package.json": ["--package.json", "-j"],
    peer: ["--peer", "-p"],
    raw: ["--raw", "-r"],
    browse: ["--browse", "-b"],
    history: ["--history", "-h"],
    similar: ["--similar", "-s"],
  };
  
  // Create a map from flag alias to flag name for quick lookup
  const aliasToFlag = Object.entries(FlagAliases).reduce((acc, [flag, aliases]) => {
    aliases.forEach(alias => {
      acc[alias] = flag;
    });
    return acc;
  }, {} as Record<string, string>);
  
  /**
   * Controller function that determines endpoint and callback based on flag
   * @param input Package name
   * @param flag Flag indicating which operation to perform
   * @returns Configuration object or undefined if flag is invalid
   */
  const controller = (input: string, flag: string | null): ControllerResult | undefined => {
    const endpoints = createEndpoint(input);
    const failedMessage = `could not find ${input}`;
    
    // Default result (no flag)
    if (!flag) {
      return {
        endpoint: endpoints.basic,
        callback: basic,
        request: "searching for package",
        failed: failedMessage,
      };
    }
    
    // Find the canonical flag name from the alias
    const flagName = aliasToFlag[flag];
    
    // If we don't recognize the flag, return undefined
    if (!flagName) return undefined;
    
    // Get the config for this flag
    const config = flagConfigs[flagName];
    
    // If no config exists (shouldn't happen if aliasToFlag is correct), return undefined
    if (!config) return undefined;
    
    // Return the result with the appropriate endpoint
    return {
      endpoint: endpoints[config.endpoint],
      callback: config.callback,
      request: config.request,
      failed: failedMessage,
    };
  };
  
  export default controller;