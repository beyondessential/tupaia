/**
 * Should be used as a wrapper when accessing caches, to ensure we aren't caching invalid lookups
 */
export const safeGet = (cache, args) => (cache.keySelector(...args) ? cache(...args) : undefined);

export const getOrgUnitFromCountry = (country, code) =>
  country && code ? country[code] : undefined;
