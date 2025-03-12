/**
 * Size formatting utilities
 */

export interface FormattedSize {
  bytes: number;
  kb: string;
  mb: string;
  pretty: string;
}

/**
 * Convert bytes to human-readable formats
 */
export function formatSizeValues(bytes: number): FormattedSize {
  const kb = (bytes / 1024).toFixed(1);
  const mb = (bytes / (1024 * 1024)).toFixed(2);

  // Determine the most appropriate unit
  let pretty: string;
  if (Number(mb) >= 1) {
    pretty = `${mb} MB`;
  } else {
    pretty = `${kb} kB`;
  }

  return {
    bytes,
    kb,
    mb,
    pretty,
  };
}

/**
 * Get color based on size (green for small, yellow for medium, red for large)
 */
export function getSizeColor(
  mb: string | number
): "success" | "warning" | "error" {
  const mbNumber = typeof mb === "string" ? parseFloat(mb) : mb;

  if (mbNumber < 0.1) return "success";
  if (mbNumber < 0.5) return "warning";
  return "error";
}

/**
 * Format size in bytes to the most appropriate unit with color
 */
export function formatSize(bytes: number): string {
  const { pretty } = formatSizeValues(bytes);
  return pretty;
}
