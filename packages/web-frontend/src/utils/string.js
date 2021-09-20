/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import sanitize from 'sanitize-filename';

/**
 *
 * @param {string} a
 * @param {string} b
 * @param {boolean} caseSensitive
 * @returns {boolean}
 */
export const areStringsEqual = (a, b, caseSensitive = true) =>
  a.toString().localeCompare(b, undefined, caseSensitive ? {} : { sensitivity: 'accent' }) === 0;

export const truncate = (str, num, ellipsis = false) => {
  if (str.length <= num) {
    return str;
  }
  return ellipsis ? `${str.slice(0, num)}...` : str.slice(0, num);
};
