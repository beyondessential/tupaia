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

export const getOrgUnitFromCountry = (country, code) => {
  const foo = country && code ? country[code] : undefined;
  if (foo === undefined) {
    // When the currentCountry is not a country but a project such as unfpa, the country[code] lookup doesn't work
    console.log('country', country);
    console.log('code', code);
  }
  return country && code ? country[code] : undefined;
};

export const selectLocation = state => state.routing;
