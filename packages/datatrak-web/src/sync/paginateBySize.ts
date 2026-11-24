/**
 * Splits rows, in order, into consecutive pages of at most `maxBytes` and `maxCount` rows each.
 *
 * A row larger than `maxBytes` on its own still has to go somewhere, so it gets a page to itself
 * rather than stalling on an empty page.
 */
export const paginateBySize = <T extends { bytes: number }>(
  rows: T[],
  maxBytes: number,
  maxCount = Infinity,
): T[][] => {
  const pages: T[][] = [];
  let page: T[] = [];
  let pageBytes = 0;
  for (const row of rows) {
    const isFull = page.length >= maxCount || pageBytes + row.bytes > maxBytes;
    if (isFull && page.length > 0) {
      pages.push(page);
      page = [];
      pageBytes = 0;
    }
    page.push(row);
    pageBytes += row.bytes;
  }
  if (page.length > 0) pages.push(page);
  return pages;
};
