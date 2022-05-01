/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';

import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { getOrgUnitFromCountry, safeGet, selectLocation } from './utils';
import { selectCurrentProjectCode } from './projectSelectors';
import { DEFAULT_BOUNDS } from '../defaults';

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

export const selectCurrentOrgUnitCode = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.ORG_UNIT),
);

const selectOrgUnitChildrenFromCache = (country, parentCode) =>
  safeGet(orgUnitChildrenCache, [country, parentCode]);

export const selectCountryHierarchy = (state, code) =>
  safeGet(countryCache, [state.orgUnits.orgUnitMap, code]);

export const selectAncestors = (country, code, level) =>
  safeGet(ancestorsCache, [country, code, level]);

export const selectAllOrgUnitsInCountry = country => safeGet(allCountryOrgUnitsCache, [country]);

export const selectDescendantsFromCache = (country, code) =>
  safeGet(descendantsCache, [country, code]);

export const selectOrgUnit = createSelector(
  [selectCountryHierarchy, (_, code) => code],
  getOrgUnitFromCountry,
);

export const selectOrgUnitCountry = createSelector([selectCountryHierarchy], country =>
  country ? country[country.countryCode] : undefined,
);

export const selectCurrentOrgUnit = createSelector(
  [state => selectOrgUnit(state, selectCurrentOrgUnitCode(state))],
  currentOrgUnit => currentOrgUnit || {},
);

export const selectCountriesAsOrgUnits = createSelector(
  [state => state.orgUnits.orgUnitMap],
  orgUnitMap =>
    Object.entries(orgUnitMap)
      .map(([countryCode, countryHierarchy]) =>
        getOrgUnitFromCountry(countryHierarchy, countryCode),
      )
      .filter(country => country && country.type === 'Country'),
);

export const selectOrgUnitChildren = createSelector(
  [
    state => selectCurrentProjectCode(state),
    state => selectCountriesAsOrgUnits(state),
    selectCountryHierarchy,
    (_, code) => code,
  ],
  (projectCode, countriesAsOrgUnits, country, code) =>
    code === projectCode ? countriesAsOrgUnits : selectOrgUnitChildrenFromCache(country, code),
);

const selectOrgUnitSiblingsAndSelf = createSelector(
  [
    state => selectCurrentProjectCode(state),
    (state, code) => getOrgUnitParent(selectOrgUnit(state, code)),
    state => selectCountriesAsOrgUnits(state),
    selectCountryHierarchy,
  ],
  (projectCode, parentCode, countriesAsOrgUnits, country) => {
    if (!parentCode) {
      return [];
    }
    return parentCode === projectCode
      ? countriesAsOrgUnits
      : selectOrgUnitChildrenFromCache(country, parentCode);
  },
);

export const selectOrgUnitSiblings = createSelector(
  [selectOrgUnitSiblingsAndSelf, (_, code) => code],
  (siblings, code) => {
    return siblings.filter(orgUnit => orgUnit.organisationUnitCode !== code);
  },
);

export const selectActiveProjectCountries = createSelector(
  [state => state.orgUnits.orgUnitMap, state => selectCurrentProjectCode(state)],
  (orgUnitMap, activeProjectCode) => {
    const orgUnits = Object.values(orgUnitMap)
      .map(({ countryCode, ...orgUnits }) => {
        return orgUnits[countryCode];
      })
      .filter((org = {}) => org.type === 'Country' && org.parent === activeProjectCode);
    return orgUnits;
  },
);

export const selectCurrentOrgUnitBounds = createSelector(
  [selectCurrentOrgUnit],
  ({ type, organisationUnitCode, location }) => {
    if (type === 'Project') {
      if (organisationUnitCode === 'explore' || organisationUnitCode === 'disaster') {
        return DEFAULT_BOUNDS;
      }
    }

    if (location && location.bounds) {
      return location.bounds;
    }

    return DEFAULT_BOUNDS;
  },
);

const getOrgUnitParent = orgUnit => (orgUnit ? orgUnit.parent : undefined);

const sortOrgUnitsAlphabeticallyByName = orgUnits => {
  // Sort countries alphabetically, this may not be the case if one country was loaded first
  return orgUnits.concat().sort((data1, data2) => {
    if (data1.name > data2.name) return 1;
    if (data1.name < data2.name) return -1;
    return 0;
  });
};

export const selectCodeFromOrgUnit = createSelector([orgUnits => orgUnits], orgUnits =>
  sortOrgUnitsAlphabeticallyByName(orgUnits).map(orgUnit => orgUnit.organisationUnitCode),
);
