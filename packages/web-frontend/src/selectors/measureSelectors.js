/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';
import { getMeasureDisplayInfo } from '@tupaia/ui-components/lib/map';
import { POLYGON_MEASURE_TYPES } from '../utils/measures';
import {
  selectActiveProjectCountries,
  selectAllOrgUnitsInCountry,
  selectAncestors,
  selectCountriesAsOrgUnits,
  selectCountryHierarchy,
  selectCurrentOrgUnitCode,
  selectDescendantsFromCache,
} from './orgUnitSelectors';
import { selectCurrentProjectCode } from './projectSelectors';
import { getOrgUnitFromCountry, safeGet } from './utils';
import { flattenMapOverlayHierarchy } from '../utils';
import { selectCurrentMapOverlayIds } from './mapOverlaySelectors';

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

const getOrgUnitFromMeasureData = (measureData, code) =>
  measureData.find(val => val.organisationUnitCode === code);

const selectDisplayInfo = (measureOptions, hiddenMeasures, measureData, organisationUnitCode) =>
  safeGet(displayInfoCache, [measureOptions, hiddenMeasures, measureData, organisationUnitCode]);

export const selectCurrentMeasureIds = createSelector(
  [selectCurrentMapOverlayIds, state => state.mapOverlayBar.mapOverlayHierarchy],
  (currentMapOverlayIds, mapOverlayHierarchy) => {
    const hierarchy = flattenMapOverlayHierarchy(mapOverlayHierarchy);

    return hierarchy.map(mapOverlay =>
      currentMapOverlayIds.includes(mapOverlay.mapOverlayId) ? mapOverlay.measureIds : [],
    );
  },
);

export const selectDisplayedMeasureIds = createSelector(
  [state => state.map.displayedMapOverlays, state => state.mapOverlayBar.mapOverlayHierarchy],
  (displayedMapOverlays, mapOverlayHierarchy) => {
    const hierarchy = flattenMapOverlayHierarchy(mapOverlayHierarchy);

    return hierarchy
      .map(mapOverlay =>
        displayedMapOverlays.includes(mapOverlay.mapOverlayId) ? mapOverlay.measureIds : [],
      )
      .flat();
  },
);

export const selectMeasureOptionsByDisplayedMapOverlays = createSelector(
  [state => state.map.measureInfo.measureOptions, selectDisplayedMeasureIds],
  (measureOptions, displayedMeasureIds) => {
    if (!measureOptions) {
      return undefined;
    }
    const displayedMeasureOptions = measureOptions.filter(({ key }) =>
      displayedMeasureIds.includes(key),
    );

    return displayedMeasureOptions.length > 0 ? displayedMeasureOptions : undefined;
  },
);

const selectDisplayLevelAncestor = createSelector(
  [
    state => selectCountryHierarchy(state, selectCurrentOrgUnitCode(state)),
    selectCurrentOrgUnitCode,
    selectMeasureOptionsByDisplayedMapOverlays,
  ],
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
    state => selectCountryHierarchy(state, state.map.measureInfo.currentCountry),
    state => state.map.measureInfo.measureData,
    selectMeasureOptionsByDisplayedMapOverlays,
    state => state.map.measureInfo.hiddenMeasures,
    state => state.map.measureInfo.currentCountry,
    state => state.map.measureInfo.measureLevel,
  ],
  (
    projectCountries,
    projectCode,
    country,
    measureData,
    measureOptions,
    hiddenMeasures,
    currentCountry,
    measureLevel,
  ) => {
    if (!currentCountry || !measureData || !country) {
      return [];
    }

    const listOfMeasureLevels = measureLevel.split(',');
    let allOrgUnitsOfLevel = selectAllOrgUnitsInCountry(country).filter(orgUnit => {
      return listOfMeasureLevels.includes(orgUnit.type);
    });
    if (currentCountry === projectCode) allOrgUnitsOfLevel = projectCountries;
    return allOrgUnitsOfLevel.map(orgUnit =>
      selectDisplayInfo(
        measureOptions,
        hiddenMeasures,
        getOrgUnitFromMeasureData(measureData, orgUnit.organisationUnitCode),
        orgUnit.organisationUnitCode,
      ),
    );
  },
);

const selectAllMeasuresWithDisplayAndOrgUnitData = createSelector(
  [
    state => selectCountryHierarchy(state, state.map.measureInfo.currentCountry),
    selectAllMeasuresWithDisplayInfo,
    state => selectCountriesAsOrgUnits(state),
  ],
  (country, allMeasureData, countries) => {
    const type = country && country[country.countryCode]?.type;

    if (type === 'Project') {
      return allMeasureData.map(data => {
        const countryData = countries.find(
          c => c.organisationUnitCode === data.organisationUnitCode,
        );
        return {
          ...data,
          ...countryData,
        };
      });
    }

    return allMeasureData.map(data => ({
      ...data,
      ...getOrgUnitFromCountry(country, data.organisationUnitCode),
    }));
  },
);

export const selectRenderedMeasuresWithDisplayInfo = createSelector(
  [
    state => selectCountryHierarchy(state, selectCurrentOrgUnitCode(state)),
    selectAllMeasuresWithDisplayAndOrgUnitData,
    selectDisplayLevelAncestor,
    selectMeasureOptionsByDisplayedMapOverlays,
    state => selectCountriesAsOrgUnits(state),
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
      displaylevelAncestor.organisationUnitCode,
    ).map(descendant => descendant.organisationUnitCode);

    return allMeasuresWithMeasureInfo.filter(measure =>
      allDescendantCodesOfAncestor.includes(measure.organisationUnitCode),
    );
  },
);
