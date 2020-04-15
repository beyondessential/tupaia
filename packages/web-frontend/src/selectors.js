import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';
import {
  POLYGON_MEASURE_TYPES,
  getMeasureDisplayInfo,
  calculateRadiusScaleFactor,
} from './utils/measures';

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
)(country => country && country.countryCode);

const orgUnitChildrenCache = createCachedSelector(
  [country => country, (_, code) => code],
  (country, code) => Object.values(country).filter(orgUnit => orgUnit.parent === code),
)((country, code) => code);

const countryAsHierarchyObjectCache = createCachedSelector(
  [country => country, (_, world) => world],
  (country, world) => recursiveBuildHierarchy(country, country[country.countryCode], world),
)((country, world) => country && country.countryCode);

const measureWithDisplayInfoCache = createCachedSelector(
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

const safeGet = (cache, args) => {
  if (!cache.keySelector(...args)) {
    return undefined;
  }

  return cache(...args);
};

const selectCountriesAsOrgUnits = createSelector([state => state.orgUnits.orgUnitMap], orgUnitMap =>
  Object.entries(orgUnitMap)
    .map(([countryCode, countryHierarchy]) => countryHierarchy[countryCode])
    .filter(country => country.organisationUnitCode !== 'World'),
);

const recursiveBuildHierarchy = (country, orgUnit, parent) => ({
  ...orgUnit,
  parent,
  organisationUnitChildren: safeGet(orgUnitChildrenCache, [
    country,
    orgUnit.organisationUnitCode,
  ]).map(child => recursiveBuildHierarchy(country, child, orgUnit)),
});

const getOrgUnitFromMeasureData = (measureData, code) =>
  measureData.find(val => val.organisationUnitCode === code);

const getOrgUnitFromCountry = (country, code) => {
  if (country === undefined) {
    return undefined;
  }
  return country[code];
};

// Public Selectors
export const selectOrgUnit = createSelector(
  [(state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]), (_, code) => code],
  getOrgUnitFromCountry,
);

export const selectOrgUnitChildren = createSelector(
  [
    state => selectCountriesAsOrgUnits(state),
    (state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]),
    (_, code) => code,
  ],
  (countriesAsOrgUnits, country, code) =>
    code === 'World' ? countriesAsOrgUnits : safeGet(orgUnitChildrenCache, [country, code]),
);

export const selectCountryAndDescendants = createSelector(
  [(state, countryCode) => safeGet(countryCache, [state.orgUnits.orgUnitMap, countryCode])],
  country => safeGet(allCountryOrgUnitsCache, [country]),
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
        safeGet(countryAsHierarchyObjectCache, [
          orgUnitMap[countryOrgUnit.organisationUnitCode],
          world,
        ]),
      ),
    };
    return hierarchy;
  },
);

export const selectHasPolygonMeasure = createSelector(
  [state => state.map.measureInfo],
  (measureInfo = {}) => {
    return (
      measureInfo.measureOptions &&
      measureInfo.measureOptions.some(option => POLYGON_MEASURE_TYPES.includes(option.type))
    );
  },
);

export const selectAllMeasuresWithDisplayInfo = createSelector(
  [
    state =>
      safeGet(countryCache, [state.orgUnits.orgUnitMap, state.map.measureInfo.currentCountry]),
    state => state.map.measureInfo.measureData,
    state => state.map.measureInfo.currentCountry,
    state => state.map.measureInfo.measureLevel,
    state => state.map.measureInfo.measureOptions,
    state => state.map.measureInfo.hiddenMeasures,
  ],
  (country, measureData, currentCountry, measureLevel, measureOptions, hiddenMeasures) => {
    if (!measureLevel || !currentCountry || !measureData || currentCountry === 'World') {
      return [];
    }

    // WARNING: Very hacky code to get measureMarker rendering correctly for AU
    // This is due to AU having two levels of 'Region' entities (see: https://github.com/beyondessential/tupaia-backlog/issues/295)
    // START OF HACK
    if (currentCountry === 'AU') {
      const parentCodes = measureData
        .map(data => getOrgUnitFromCountry(country, data.organisationUnitCode))
        .filter(orgUnit => orgUnit)
        .map(orgUnit => orgUnit.parent)
        .filter((parentCode, index, self) => self.indexOf(parentCode) === index); //Filters for uniqueness

      const allSiblingOrgUnits = parentCodes.reduce(
        (arr, parentCode) => [...arr, ...safeGet(orgUnitChildrenCache, [country, parentCode])],
        [],
      );

      return allSiblingOrgUnits.map(orgUnit =>
        safeGet(measureWithDisplayInfoCache, [
          measureOptions,
          hiddenMeasures,
          getOrgUnitFromMeasureData(measureData, orgUnit.organisationUnitCode),
          orgUnit.organisationUnitCode,
        ]),
      );
    }
    // END OF HACK
    // Ideally, we should be using the below code instead for all orgUnits

    const listOfMeasureLevels = measureLevel.split(',');
    const allOrgUnitsOfLevel = safeGet(allCountryOrgUnitsCache, [country]).filter(orgUnit =>
      listOfMeasureLevels.includes(orgUnit.type),
    );
    return allOrgUnitsOfLevel.map(orgUnit =>
      safeGet(measureWithDisplayInfoCache, [
        measureOptions,
        hiddenMeasures,
        getOrgUnitFromMeasureData(measureData, orgUnit.organisationUnitCode),
        orgUnit.organisationUnitCode,
      ]),
    );
  },
);

export const selectAllMeasuresWithDisplayAndOrgUnitData = createSelector(
  [
    state =>
      safeGet(countryCache, [state.orgUnits.orgUnitMap, state.map.measureInfo.currentCountry]),
    selectAllMeasuresWithDisplayInfo,
  ],
  (country, allMeasureData) =>
    allMeasureData.map(data => ({
      ...data,
      ...getOrgUnitFromCountry(country, data.organisationUnitCode),
    })),
);

export const selectRadiusScaleFactor = createSelector(
  [selectAllMeasuresWithDisplayInfo],
  calculateRadiusScaleFactor,
);
