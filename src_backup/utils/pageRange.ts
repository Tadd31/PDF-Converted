/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses page range strings such as "1-5, 8, 11-13" and returns an array of sorted unique page numbers.
 * Defaults to all pages if the range string is empty or invalid.
 */
export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  const trimmed = rangeStr.trim();
  if (!trimmed) {
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  const parts = trimmed.split(',');

  for (const part of parts) {
    const cleanPart = part.trim();
    if (!cleanPart) continue;

    if (cleanPart.includes('-')) {
      const [startStr, endStr] = cleanPart.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pages.add(i);
        }
      }
    } else {
      const page = parseInt(cleanPart, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        pages.add(page);
      }
    }
  }

  const result = Array.from(pages).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: maxPages }, (_, i) => i + 1);
}
