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
      generation = [].concat(
        ...generation
          .filter(generationOrgUnit => generationOrgUnit.type !== level)
          .map(parentOrgUnit =>
            countryOrgUnits.filter(
              childOrgUnit => childOrgUnit.parent === parentOrgUnit.organisationUnitCode,
            ),
          ),
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
)((country, code, level) => `${code}_${level}`);

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
    .filter(country => country.organisationUnitCode !== 'World'),
);

const getOrgUnitFromMeasureData = (measureData, code) =>
  measureData.find(val => val.organisationUnitCode === code);

const getOrgUnitFromCountry = (country, code) => (country && code ? country[code] : undefined);

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
    state => selectCountriesAsOrgUnits(state),
    (state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]),
    (_, code) => code,
  ],
  (countriesAsOrgUnits, country, code) =>
    code === 'World' ? countriesAsOrgUnits : safeGet(orgUnitChildrenCache, [country, code]),
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
    if (
      !measureLevel ||
      !currentCountry ||
      !measureData ||
      currentCountry === 'World' ||
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

export const selectRenderedMeasuresWithDisplayInfo = createSelector(
  [
    state =>
      safeGet(countryCache, [
        state.orgUnits.orgUnitMap,
        state.global.currentOrganisationUnit.organisationUnitCode,
      ]),
    selectAllMeasuresWithDisplayAndOrgUnitData,
    state => state.global.currentOrganisationUnit,
    state => state.map.measureInfo.measureOptions,
  ],
  (country, allMeasuresWithMeasureInfo, currentOrgUnit = {}, measureOptions = []) => {
    if (!currentOrgUnit.organisationUnitCode) {
      return [];
    }

    const displayOnLevel = measureOptions.map(option => option.displayOnLevel).find(level => level);
    if (!displayOnLevel) {
      return allMeasuresWithMeasureInfo;
    }

    const displaylevelAncestor = ancestorsCache(
      country,
      currentOrgUnit.organisationUnitCode,
      displayOnLevel,
    ).find(ancestor => ancestor.type === displayOnLevel);

    if (!displaylevelAncestor) {
      return [];
    }

    const allDescendantCodesOfAncestor = descendantsCache(
      country,
      displaylevelAncestor.organisationUnitCode,
    ).map(descendant => descendant.organisationUnitCode);

    return allMeasuresWithMeasureInfo.filter(measure =>
      allDescendantCodesOfAncestor.includes(measure.organisationUnitCode),
    );
  },
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
