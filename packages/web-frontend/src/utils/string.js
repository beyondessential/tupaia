/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 *
 * @param {string} a
 * @param {string} b
 * @param {boolean} caseSensitive
 * @returns {boolean}
 */
export const areStringsEqual = (a, b, caseSensitive = true) =>
  a.localeCompare(b, undefined, caseSensitive ? {} : { sensitivity: 'accent' }) === 0;
