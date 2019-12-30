/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { find, isString, isNumber } from 'lodash';

import { areStringsEqual } from './string';

/**
 * Searches for an item in a collection by the provided key
 *
 * @param {Array|Object|} collection
 * @param {number|string} key
 * @param {boolean} caseSensitive
 * @returns {*} The found value on success, `undefined` on failure
 */
export const findByKey = (collection, key, caseSensitive = true) =>
  (isString(key) || isNumber(key)) &&
  find(collection, (value, currentKey) => areStringsEqual(key, currentKey, caseSensitive));
