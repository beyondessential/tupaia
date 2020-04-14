import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';

// Attempt to use previously set tab name, revert to first tab if not available for this org unit.
export const getCurrentDashboardKey = ({ dashboard, global }) => {
  const { dashboardConfig } = global;
  const { currentDashboardKey } = dashboard;
  return dashboardConfig[currentDashboardKey]
    ? currentDashboardKey
    : Object.keys(dashboardConfig)[0];
};

/**
 * Selectors
 *
 * The Selector Code:
 *  1. All public selectors should take 'state' as their first parameter
 *  2. Caching should never be done on a public selector
 *  3. Caches should take their most normalised state objects as arguments
 *
 */

// Private caches

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
)(country => country.countryCode);

const orgUnitChildrenCache = createCachedSelector(
  [country => country, (_, code) => code],
  (country, code) => Object.values(country).filter(orgUnit => orgUnit.parent === code),
)((country, code) => code);

const countryAsHierarchyObjectCache = createCachedSelector(
  [country => country, (_, world) => world],
  (country, world) => recursiveBuildHierarchy(country, country[country.countryCode], world),
)((country, world) => country.countryCode);

// Private utility functions

const selectCountriesAsOrgUnits = createSelector([state => state.orgUnits.orgUnitMap], orgUnitMap =>
  Object.entries(orgUnitMap)
    .map(([countryCode, countryHierarchy]) => countryHierarchy[countryCode])
    .filter(country => country.organisationUnitCode !== 'World'),
);

const recursiveBuildHierarchy = (state, orgUnit, parent) => ({
  ...orgUnit,
  parent,
  organisationUnitChildren: orgUnitChildrenCache(state, orgUnit.organisationUnitCode).map(child =>
    recursiveBuildHierarchy(state, child, orgUnit),
  ),
});

// Public Selectors
export const selectOrgUnit = createSelector(
  [(state, code) => countryCache(state.orgUnits.orgUnitMap, code), (_, code) => code],
  (country, code) => {
    if (country === undefined) {
      return undefined;
    }
    return country[code];
  },
);

export const cachedSelectOrgUnitChildren = createSelector(
  [
    state => selectCountriesAsOrgUnits(state),
    (state, code) => countryCache(state.orgUnits.orgUnitMap, code),
    (_, code) => code,
  ],
  (countriesAsOrgUnits, country, code) =>
    code === 'World' ? countriesAsOrgUnits : orgUnitChildrenCache(country, code),
);

export const selectCountryAndDescendants = createSelector(
  [(state, countryCode) => countryCache(state.orgUnits.orgUnitMap, countryCode)],
  allCountryOrgUnitsCache,
);

export const selectOrgUnitsAsHierarchy = createSelector(
  [state => state.orgUnits.orgUnitMap, selectCountriesAsOrgUnits],
  (orgUnitMap, countriesAsOrgUnits) => {
    const world = orgUnitMap.World;
    if (!world) {
      return {};
    }

    const hierarchy = {
      ...world,
      organisationUnitChildren: countriesAsOrgUnits.map(countryOrgUnit =>
        countryAsHierarchyObjectCache(orgUnitMap[countryOrgUnit.organisationUnitCode], world),
      ),
    };
    return hierarchy;
  },
);
