import { createSelector } from 'reselect';
import { POLYGON_MEASURE_TYPES, calculateRadiusScaleFactor } from '../utils/measures';
import { getMeasureFromHierarchy } from '../utils';
import {
  selectCurrentProjectCode,
  selectCurrentOrgUnitCode,
  selectCurrentOverlayCode,
  selectCurrentOrgUnit,
  selectCountryHeirachy,
  selectAncestors,
  selectAllOrgUnitsInCountry,
  selectDisplayInfo,
  selectDescendantsFromCache,
  getOrgUnitFromCountry,
} from './baseSelectors';

// QUESTION: Good pattern? Selectors folder?

/**
 * Selectors
 * These can be handy tools to allow for components/sagas to interact with the redux state, and fetch data from it.
 * It allows us to define usefully composed aspects of the state, so that clients are not so tightly coupled with the
 * internal structure of state. With the use of memoization, and caching, we are also able to improve the performance
 * of state lookups, and importantly cut down on React re-render calls.
 */

// Private selectors

const selectActiveProjectCountries = createSelector(
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

const selectDisplayLevelAncestor = createSelector(
  [selectCurrentOrgUnit, selectCurrentOrgUnitCode, state => state.map.measureInfo.measureOptions],
  (country, currentOrganisationUnitCode, measureOptions) => {
    if (!country || !currentOrganisationUnitCode || !measureOptions) {
      return undefined;
    }

    const displayOnLevel = measureOptions.map(option => option.displayOnLevel).find(level => level);
    if (!displayOnLevel) {
      return undefined;
    }

    return selectAncestors(country, currentOrganisationUnitCode, displayOnLevel).find(
      ancestor => ancestor.type === displayOnLevel,
    );
  },
);

export const selectCurrentMeasure = createSelector(
  [selectCurrentOverlayCode, state => state.measureBar.measureHierarchy],
  (currentMeasureId, measureHierarchy) =>
    getMeasureFromHierarchy(measureHierarchy, currentMeasureId),
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
    state => selectCurrentProjectCode(state),
    state => selectCountryHeirachy(state, state.map.measureInfo.currentCountry),
    state => state.map.measureInfo.measureData,
    state => state.map.measureInfo.currentCountry,
    state => state.map.measureInfo.measureLevel,
  ],
  (projectCountries, projectCode, country, measureData, currentCountry, measureLevel) => {
    if (!currentCountry || !measureData || !country) {
      return [];
    }

    const listOfMeasureLevels = measureLevel.split(',');
    let allOrgUnitsOfLevel = selectAllOrgUnitsInCountry(country).filter(orgUnit => {
      return listOfMeasureLevels.includes(orgUnit.type);
    });
    if (currentCountry === projectCode) allOrgUnitsOfLevel = projectCountries;

    return allOrgUnitsOfLevel.map(orgUnit => selectDisplayInfo(state, orgUnit));
  },
);

export const selectAllMeasuresWithDisplayAndOrgUnitData = createSelector(
  [
    state => selectCountryHeirachy(state, state.map.measureInfo.currentCountry),
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
    selectCurrentOrgUnit,
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

    const allDescendantCodesOfAncestor = selectDescendantsFromCache(
      country,
      displaylevelAncestor,
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

export const selectMeasureBarItemById = createSelector(
  [state => state.measureBar.measureHierarchy, (_, id) => id],
  (measureHierarchy, id) => {
    const flattenedMeasureHierarchy = [].concat(...Object.values(measureHierarchy));
    return flattenedMeasureHierarchy.find(measure => measure.measureId === id);
  },
);
