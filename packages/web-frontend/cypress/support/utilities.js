/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const equalStringsI = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) === 0;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 */
export const escapeRegex = string => {
  // $& means the whole matched string
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
};
