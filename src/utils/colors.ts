import { color } from "bun";

// Color utilities for terminal output
export const success = (text: string): string =>
  color("#50FA7B", "ansi-256") + text + "\x1b[0m";
export const warning = (text: string): string =>
  color("#D5DE7C", "ansi-256") + text + "\x1b[0m";
export const error = (text: string): string =>
  color("#FF79C6", "ansi-256") + text + "\x1b[0m";
export const info = (text: string): string =>
  color("#282A36", "ansi-256") + text + "\x1b[0m";
export const dim = (text: string): string =>
  color("#282A36", "ansi-256") + text + "\x1b[0m";
export const bold = (text: string): string =>
  color("#F8F8F2", "ansi-256") + text + "\x1b[0m";
export const bullet = (text: string): string => `${warning("•")} ${text}`;
