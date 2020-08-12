/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Should be used as a wrapper when accessing caches, to ensure we aren't caching invalid lookups
 */
export const safeGet = (cache, args) => (cache.keySelector(...args) ? cache(...args) : undefined);

export const getOrgUnitFromCountry = (country, code) =>
  country && code ? country[code] : undefined;
