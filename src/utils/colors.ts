const ANSI_RESET = "\x1b[0m";

function shouldUseColor(): boolean {
  if ("NO_COLOR" in process.env) {
    return false;
  }

  if ("FORCE_COLOR" in process.env) {
    return process.env.FORCE_COLOR !== "0";
  }

  return Boolean(process.stdout.isTTY);
}

function colorize(code: string, text: string): string {
  if (!shouldUseColor()) {
    return text;
  }

  return `${code}${text}${ANSI_RESET}`;
}

// Color utilities for terminal output
export const success = (text: string): string => colorize("\x1b[32m", text);
export const warning = (text: string): string => colorize("\x1b[33m", text);
export const error = (text: string): string => colorize("\x1b[31m", text);
export const info = (text: string): string => colorize("\x1b[36m", text);
export const dim = (text: string): string => colorize("\x1b[2m", text);
export const bold = (text: string): string => colorize("\x1b[1m", text);
export const bullet = (text: string): string => `${warning("•")} ${text}`;
