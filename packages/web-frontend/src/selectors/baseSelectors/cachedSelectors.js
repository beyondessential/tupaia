import createCachedSelector from 're-reselect';
import { getMeasureDisplayInfo } from '../../utils/measures';

/**
 * Private caches
 * These caches make use of 're-reselect's key'd selector cache to utilize memoization when performing regular lookups
 * across a range of values. See re-reselect documentation: https://github.com/toomuchdesign/re-reselect
 *
 * In my (rather limited) experience, it's best to keep the arguments for cached selectors as specific as possible in order
 * to allow for greater reuse among multiple selectors. As such, it seems best to keep these caches private, and if they are to
 * be accessed publicly, wrap them in a public selector (see Public Selectors below).
 */

const countryCache = createCachedSelector(
  [orgUnitMap => orgUnitMap, (_, code) => code],
  (orgUnitMap, code) => {
    if (orgUnitMap[code]) {
      // It's a country, or World
      return orgUnitMap[code];
    }

    return Object.values(orgUnitMap).find(countryHierarchy => countryHierarchy[code]);
  },
)((orgUnitMap, code) => code);

const allCountryOrgUnitsCache = createCachedSelector([country => country], country =>
  Object.values(country),
)(country => country && country.countryCode);

const orgUnitChildrenCache = createCachedSelector(
  [country => country, (_, code) => code],
  (country, code) => Object.values(country).filter(orgUnit => orgUnit.parent === code),
)((country, code) => code);

const descendantsCache = createCachedSelector(
  [country => country, allCountryOrgUnitsCache, (_, code) => code, (_, __, level) => level],
  (country, countryOrgUnits, code, level) => {
    const orgUnit = getOrgUnitFromCountry(country, code);
    if (!orgUnit) {
      return undefined;
    }

    if (orgUnit.type === level) {
      return [orgUnit];
    }

    const descendants = [];
    let generation = [orgUnit];
    while (generation.length > 0) {
      descendants.push(...generation);
      const nextGenParentCodes = generation
        .filter(generationOrgUnit => generationOrgUnit.type !== level)
        .map(nextGenParent => nextGenParent.organisationUnitCode);
      generation = countryOrgUnits.filter(childOrgUnit =>
        nextGenParentCodes.includes(childOrgUnit.parent),
      );
    }

    return descendants;
  },
)((country, code, level) => `${code}_${level}`);

const ancestorsCache = createCachedSelector(
  [country => country, (_, code) => code, (_, __, level) => level],
  (country, code, level) => {
    const orgUnit = getOrgUnitFromCountry(country, code);
    if (!orgUnit) {
      return undefined;
    }

    if (orgUnit.type === level) {
      return [orgUnit];
    }

    const ancestors = [];
    let ancestor = orgUnit;
    while (ancestor) {
      ancestors.push(ancestor);
      if (ancestor.type === level) {
        return ancestors;
      }

      ancestor = getOrgUnitFromCountry(country, ancestor.parent);
    }

    return ancestors;
  },
)((_, code, level) => `${code}_${level}`);

const displayInfoCache = createCachedSelector(
  [
    measureOptions => measureOptions,
    (_, hiddenMeasures) => hiddenMeasures,
    (_, __, data) => data,
    (_, __, ___, organisationUnitCode) => organisationUnitCode,
  ],
  (options = [], hiddenMeasures, data, organisationUnitCode) => {
    return {
      organisationUnitCode,
      ...data,
      ...getMeasureDisplayInfo({ ...data }, options, hiddenMeasures),
    };
  },
)((_, __, ___, organisationUnitCode) => organisationUnitCode);

// Private utility functions

/**
 * Should be used as a wrapper when accessing caches, to ensure we aren't caching invalid lookups
 */
const safeGet = (cache, args) => (cache.keySelector(...args) ? cache(...args) : undefined);

// Not sure where these go?
export const getOrgUnitFromCountry = (country, code) =>
  country && code ? country[code] : undefined;

const getOrgUnitFromMeasureData = (measureData, code) =>
  measureData.find(val => val.organisationUnitCode === code);

// These selectors are the only ones that can access caches, and must do so through safeGet.

export const selectOrgUnitChildrenFromCache = (country, parentCode) =>
  safeGet(orgUnitChildrenCache, [country, parentCode]);

export const selectCountryHeirachy = (state, code) =>
  safeGet(countryCache, [state.orgUnits.orgUnitMap, code]);

export const selectAncestors = (country, code, level) =>
  safeGet(ancestorsCache, [country, code, level]);

export const selectAllOrgUnitsInCountry = country => safeGet(allCountryOrgUnitsCache, [country]);

export const selectDisplayInfo = (state, orgUnit) =>
  safeGet(displayInfoCache, [
    state.map.measureInfo.measureOptions,
    state.map.measureInfo.hiddenMeasures,
    getOrgUnitFromMeasureData(state.map.measureInfo.measureData, orgUnit.organisationUnitCode),
    orgUnit.organisationUnitCode,
  ]);

export const selectDescendantsFromCache = (country, code) =>
  safeGet(descendantsCache, [country, code]);
