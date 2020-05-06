import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';
import {
  POLYGON_MEASURE_TYPES,
  getMeasureDisplayInfo,
  calculateRadiusScaleFactor,
} from './utils/measures';

/**
 * Selectors
 * These can be handy tools to allow for components/sagas to interact with the redux state, and fetch data from it.
 * It allows us to define usefully composed aspects of the state, so that clients are not so tightly coupled with the
 * internal structure of state. With the use of memoization, and caching, we are also able to improve the performance
 * of state lookups, and importantly cut down on React re-render calls.
 */

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

const countryAsHierarchyObjectCache = createCachedSelector(
  [country => country, (_, world) => world],
  (country, world) => recursiveBuildHierarchy(country, country[country.countryCode], world),
)(country => country && country.countryCode);

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

const selectCountriesAsOrgUnits = createSelector([state => state.orgUnits.orgUnitMap], orgUnitMap =>
  Object.entries(orgUnitMap)
    .map(([countryCode, countryHierarchy]) => countryHierarchy[countryCode])
    .filter(country => country.type === 'Country'),
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

const getOrgUnitFromCountry = (country, code) => (country ? country[code] : undefined);

/**
 * Public Selectors
 * These selectors are the ones consumed by components/sagas/everything else. So far it has seemed a good practice to
 * standardise all public selectors to accept the whole `state` as the first parameter. The state is easily accessible
 * from mapStateToProps in components, and via `yield select()` in sagas.
 */
export const selectOrgUnit = createSelector(
  [(state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]), (_, code) => code],
  getOrgUnitFromCountry,
);

export const selectOrgUnitCountry = createSelector(
  [(state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]), (_, code) => code],
  country => (country ? country[country.countryCode] : undefined),
);

export const selectOrgUnitChildren = createSelector(
  [
    state => state.project.active.code,
    state => selectCountriesAsOrgUnits(state),
    (state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]),
    (_, code) => code,
  ],
  (projectCode, countriesAsOrgUnits, country, code) =>
    code === projectCode ? countriesAsOrgUnits : safeGet(orgUnitChildrenCache, [country, code]),
);

export const selectOrgUnitsAsHierarchy = createSelector(
  [state => state.orgUnits.orgUnitMap, selectCountriesAsOrgUnits],
  (orgUnitMap, countriesAsOrgUnits) => {
    const world = orgUnitMap.World && orgUnitMap.World.World;
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
    state => state.project.active.code,
    state =>
      safeGet(countryCache, [state.orgUnits.orgUnitMap, state.map.measureInfo.currentCountry]),
    state => state.map.measureInfo.measureData,
    state => state.map.measureInfo.currentCountry,
    state => state.map.measureInfo.measureLevel,
    state => state.map.measureInfo.measureOptions,
    state => state.map.measureInfo.hiddenMeasures,
  ],
  (
    projectCode,
    country,
    measureData,
    currentCountry,
    measureLevel,
    measureOptions,
    hiddenMeasures,
  ) => {
    if (
      !measureLevel ||
      !currentCountry ||
      !measureData ||
      currentCountry === projectCode ||
      !country
    ) {
      return [];
    }

    const listOfMeasureLevels = measureLevel.split(',');
    const allOrgUnitsOfLevel = safeGet(allCountryOrgUnitsCache, [country]).filter(orgUnit =>
      listOfMeasureLevels.includes(orgUnit.type),
    );

    return allOrgUnitsOfLevel.map(orgUnit =>
      safeGet(displayInfoCache, [
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

export const selectCurrentDashboardKey = createSelector(
  [state => state.global.dashboardConfig, state => state.dashboard.currentDashboardKey],
  (dashboardConfig, currentDashboardKey) =>
    dashboardConfig[currentDashboardKey] ? currentDashboardKey : Object.keys(dashboardConfig)[0],
);

export const selectIsProject = createSelector(
  [state => state.project.projects, (_, code) => code],
  (projects, code) => projects.map(project => project.code).includes(code),
);

export const selectProjectByCode = (state, code) =>
  state.project.projects.find(p => p.code === code);

export const selectActiveProject = state => state.project.active;
