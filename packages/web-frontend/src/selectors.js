import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';
import {
  POLYGON_MEASURE_TYPES,
  getMeasureDisplayInfo,
  calculateRadiusScaleFactor,
  flattenMeasureHierarchy,
  findMeasureFromFlattenedMeasureList,
} from './utils/measures';
import { initialOrgUnit } from './defaults';

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

const selectActiveProjectCountries = createSelector(
  [state => state.orgUnits.orgUnitMap, state => state.project.activeProjectCode],
  (orgUnitMap, activeProjectCode) => {
    const orgUnits = Object.values(orgUnitMap)
      .map(({ countryCode, ...orgUnits }) => {
        return orgUnits[countryCode];
      })
      .filter((org = {}) => org.type === 'Country' && org.parent === activeProjectCode);
    return orgUnits;
  },
);

const selectCountriesAsOrgUnits = createSelector([state => state.orgUnits.orgUnitMap], orgUnitMap =>
  Object.entries(orgUnitMap)
    .map(([countryCode, countryHierarchy]) => getOrgUnitFromCountry(countryHierarchy, countryCode))
    .filter(country => country && country.type === 'Country'),
);

const selectOrgUnitSiblingsAndSelf = createSelector(
  [
    state => state.project.activeProjectCode,
    (state, code) => getOrgUnitParent(selectOrgUnit(state, code)),
    state => selectCountriesAsOrgUnits(state),
    (state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]),
  ],
  (projectCode, parentCode, countriesAsOrgUnits, country) => {
    if (!parentCode) {
      return [];
    }
    return parentCode === projectCode
      ? countriesAsOrgUnits
      : safeGet(orgUnitChildrenCache, [country, parentCode]);
  },
);

const getOrgUnitFromMeasureData = (measureData, code) =>
  measureData.find(val => val.organisationUnitCode === code);

const getOrgUnitFromCountry = (country, code) => (country && code ? country[code] : undefined);

const selectDisplayLevelAncestor = createSelector(
  [
    state =>
      safeGet(countryCache, [state.orgUnits.orgUnitMap, state.global.currentOrganisationUnitCode]),
    state => state.global.currentOrganisationUnitCode,
    state => state.map.measureInfo.measureOptions,
  ],
  (country, currentOrganisationUnitCode, measureOptions) => {
    if (!country || !currentOrganisationUnitCode || !measureOptions) {
      return undefined;
    }

    const displayOnLevel = measureOptions.map(option => option.displayOnLevel).find(level => level);
    if (!displayOnLevel) {
      return undefined;
    }

    return ancestorsCache(country, currentOrganisationUnitCode, displayOnLevel).find(
      ancestor => ancestor.type === displayOnLevel,
    );
  },
);

const getOrgUnitParent = orgUnit => (orgUnit ? orgUnit.parent : undefined);

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

export const selectCurrentOrgUnit = createSelector(
  [state => selectOrgUnit(state, state.global.currentOrganisationUnitCode)],
  currentOrgUnit => currentOrgUnit || {},
);

export const selectOrgUnitChildren = createSelector(
  [
    state => state.project.activeProjectCode,
    state => selectCountriesAsOrgUnits(state),
    (state, code) => safeGet(countryCache, [state.orgUnits.orgUnitMap, code]),
    (_, code) => code,
  ],
  (projectCode, countriesAsOrgUnits, country, code) =>
    code === projectCode ? countriesAsOrgUnits : safeGet(orgUnitChildrenCache, [country, code]),
);

export const selectOrgUnitSiblings = createSelector(
  [selectOrgUnitSiblingsAndSelf, (_, code) => code],
  (siblings, code) => {
    return siblings.filter(orgUnit => orgUnit.organisationUnitCode !== code);
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
    state => selectActiveProjectCountries(state),
    state => state.project.activeProjectCode,
    state =>
      safeGet(countryCache, [state.orgUnits.orgUnitMap, state.map.measureInfo.currentCountry]),
    state => state.map.measureInfo.measureData,
    state => state.map.measureInfo.currentCountry,
    state => state.map.measureInfo.measureLevel,
    state => state.map.measureInfo.measureOptions,
    state => state.map.measureInfo.hiddenMeasures,
  ],
  (
    projectCountries,
    projectCode,
    country,
    measureData,
    currentCountry,
    measureLevel,
    measureOptions,
    hiddenMeasures,
  ) => {
    if (!currentCountry || !measureData || !country) {
      return [];
    }

    const listOfMeasureLevels = measureLevel.split(',');
    let allOrgUnitsOfLevel = safeGet(allCountryOrgUnitsCache, [country]).filter(orgUnit => {
      return listOfMeasureLevels.includes(orgUnit.type);
    });
    if (currentCountry === projectCode) allOrgUnitsOfLevel = projectCountries;

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
      safeGet(countryCache, [state.orgUnits.orgUnitMap, state.global.currentOrganisationUnitCode]),
    selectAllMeasuresWithDisplayAndOrgUnitData,
    selectDisplayLevelAncestor,
    state => state.map.measureInfo.measureOptions,
  ],
  (country, allMeasuresWithMeasureInfo, displaylevelAncestor, measureOptions = []) => {
    const displayOnLevel = measureOptions.map(option => option.displayOnLevel).find(level => level);
    if (!displayOnLevel) {
      return allMeasuresWithMeasureInfo;
    }

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

export const selectIsProject = createSelector(
  [state => state.project.projects, (_, code) => code],
  (projects, code) => projects.some(project => project.code === code),
);

export const selectProjectByCode = (state, code) =>
  state.project.projects.find(p => p.code === code);

export const selectActiveProjectCode = state => state.project.activeProjectCode;

export const selectActiveProject = createSelector(
  [state => selectProjectByCode(state, state.project.activeProjectCode)],
  activeProject => activeProject || {},
);

export const selectAdjustedProjectBounds = (state, code) => {
  if (code === 'explore' || code === 'disaster') {
    return initialOrgUnit.location.bounds;
  }
  const project = selectProjectByCode(state, code);
  return project && project.bounds;
};

export const selectMeasureBarItemById = createSelector(
  [state => state.measureBar.measureHierarchy, (_, id) => id],
  (measureHierarchy, id) => {
    const flattenedMeasureHierarchy = flattenMeasureHierarchy(measureHierarchy);
    return findMeasureFromFlattenedMeasureList(flattenedMeasureHierarchy, id);
  },
);
