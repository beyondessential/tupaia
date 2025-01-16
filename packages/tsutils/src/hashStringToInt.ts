/**
 * Convert a string to an integer hash
 * Kudos: https://rclayton.silvrback.com/distributed-locking-with-postgres-advisory-locks
 */
export const hashStringToInt = (str: string) => {
  let hash = 5381;
  let i = -1;
  while (i < str.length - 1) {
    i += 1;
    // eslint-disable-next-line no-bitwise
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // eslint-disable-next-line no-bitwise
  return hash >>> 0;
};
