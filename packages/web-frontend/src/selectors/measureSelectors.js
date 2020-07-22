import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';

import { getMeasureFromHierarchy } from '../utils';
import {
  getMeasureDisplayInfo,
  POLYGON_MEASURE_TYPES,
  calculateRadiusScaleFactor,
} from '../utils/measures';

import { getUrlComponent, URL_COMPONENTS } from '../historyNavigation';

import { selectLocation, safeGet, getOrgUnitFromCountry } from './utils';
import {
  selectCurrentOrgUnit,
  selectCurrentOrgUnitCode,
  selectAncestors,
  selectActiveProjectCountries,
  selectCountryHeirachy,
  selectAllOrgUnitsInCountry,
  selectDescendantsFromCache,
} from './orgUnitSelectors';

import { selectCurrentProjectCode } from './projectSelectors';

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

const selectOrgUnitFromMeasureData = createSelector(
  [state => state.map.measureInfo.measureData, (_, orgUnit) => orgUnit.organisationUnitCode],
  (measureData, code) => measureData.find(val => val.organisationUnitCode === code),
);

export const selectDisplayInfo = (state, orgUnit) =>
  safeGet(displayInfoCache, [
    state.map.measureInfo.measureOptions,
    state.map.measureInfo.hiddenMeasures,
    selectOrgUnitFromMeasureData,
    orgUnit.organisationUnitCode,
  ]);

export const selectCurrentOverlayCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.MEASURE, location),
);

export const selectCurrentMeasure = createSelector(
  [selectCurrentOverlayCode, state => state.measureBar.measureHierarchy],
  (currentMeasureId, measureHierarchy) =>
    getMeasureFromHierarchy(measureHierarchy, currentMeasureId),
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

    return allOrgUnitsOfLevel.map(orgUnit => getDisplayInfo(state, orgUnit));
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
