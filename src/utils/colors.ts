import picocolors from "picocolors";

// Color utilities for terminal output
export const success = (text: string): string => picocolors.green(text);
export const warning = (text: string): string => picocolors.yellow(text);
export const error = (text: string): string => picocolors.red(text);
export const info = (text: string): string => picocolors.blue(text);
export const dim = (text: string): string => picocolors.dim(text);
export const bold = (text: string): string => picocolors.bold(text);
export const bullet = (text: string): string => `${warning("•")} ${text}`;
