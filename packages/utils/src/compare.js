/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const compareAsc = (a, b) => {
  const types = [typeof a, typeof b];

  if (types.every(t => t === 'string')) {
    return a.localeCompare(b, undefined, { numeric: true });
  }
  if (types.includes('number') && types.includes('string')) {
    // Numbers are placed before strings
    return typeof a === 'number' ? -1 : 1;
  }

  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
};

export const compareDesc = (a, b) => compareAsc(a, b) * -1;
