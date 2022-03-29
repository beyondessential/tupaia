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
      ...getMeasureDisplayInfo(data, options, hiddenMeasures),
    };
  },
)((_, __, ___, organisationUnitCode) => organisationUnitCode);

const getMeasureDataByOrgUnit = (measureData, code) =>
  measureData.find(val => val.organisationUnitCode === code);

const selectDisplayInfo = (measureOptions, hiddenMeasures, measureData, organisationUnitCode) =>
  safeGet(displayInfoCache, [measureOptions, hiddenMeasures, measureData, organisationUnitCode]);

export const selectMeasureOptions = createSelector(
  [state => state.map.measureInfo, (_, mapOverlayCodes) => mapOverlayCodes],
  (measureInfo = {}, mapOverlayCodes) => {
    const selectedMeasureOptions = mapOverlayCodes.reduce((results, mapOverlayCode) => {
      const { measureOptions = [] } = measureInfo[mapOverlayCode] || {};
      return [...results, ...measureOptions];
    }, []);

    const measureOptionsByKey = selectedMeasureOptions.reduce((results, measureOption) => {
      const { key } = measureOption;
      return results[key] ? results : { ...results, [key]: measureOption };
    }, {});

    const filteredMeasureOptions = Object.values(measureOptionsByKey);
    return filteredMeasureOptions.length > 0 ? filteredMeasureOptions : undefined;
  },
);

export const selectMeasureData = createSelector(
  [state => state.map.measureInfo, (_, mapOverlayCodes) => mapOverlayCodes],
  (measureInfo, mapOverlayCodes) => {
    if (!measureInfo || mapOverlayCodes.length === 0) {
      return [];
    }

    const measureData = {};
    mapOverlayCodes.forEach(mapOverlayCode => {
      const selectedMeasureData = measureInfo[mapOverlayCode]?.measureData;
      if (selectedMeasureData) {
        selectedMeasureData.forEach(measure => {
          measureData[measure.organisationUnitCode] = Object.assign(
            measureData[measure.organisationUnitCode] || {},
            measure,
          );
        });
      }
    });
    return Object.keys(measureData).length === 0 ? [] : Object.values(measureData);
  },
);

const selectMeasureLevel = createSelector(
  [state => state.map.measureInfo, (_, mapOverlayCodes) => mapOverlayCodes],
  (measureInfo, mapOverlayCodes) => {
    let measureLevelArray = [];

    mapOverlayCodes.forEach(mapOverlayCode => {
      const { measureLevel: selectedMeasureLevel = [] } = measureInfo[mapOverlayCode] || {};
      measureLevelArray = [...measureLevelArray, ...selectedMeasureLevel];
    });

    return [...new Set(measureLevelArray)];
  },
);

export const selectHasPolygonMeasure = createSelector(
  [state => state.map.measureInfo, state => state.map.displayedMapOverlays],
  (measureInfo = {}, displayedMapOverlays) => {
    for (const displayedMapOverlayCode of displayedMapOverlays) {
      if (
        measureInfo[displayedMapOverlayCode]?.measureOptions &&
        measureInfo[displayedMapOverlayCode].measureOptions.some(option =>
          POLYGON_MEASURE_TYPES.includes(option.type),
        )
      ) {
        return true;
      }
    }
    return false;
  },
);

export const selectMeasuresWithDisplayInfo = createSelector(
  [
    selectActiveProjectCountries,
    selectCurrentProjectCode,
    state => selectCountryHierarchy(state, state.map.currentCountry),
    selectMeasureData,
    selectMeasureOptions,
    selectMeasureLevel,
    state => state.map.hiddenMeasures,
    state => state.map.currentCountry,
  ],
  (
    projectCountries,
    projectCode,
    country,
    measureData,
    measureOptions,
    measureLevel,
    hiddenMeasures,
    currentCountry,
  ) => {
    if (!currentCountry || !country) {
      return [];
    }

    const allOrgUnitsOfLevel =
      currentCountry === projectCode
        ? projectCountries
        : selectAllOrgUnitsInCountry(country).filter(orgUnit =>
            measureLevel.includes(orgUnit.type),
          );

    return allOrgUnitsOfLevel.map(orgUnit =>
      selectDisplayInfo(
        measureOptions,
        hiddenMeasures,
        getMeasureDataByOrgUnit(measureData, orgUnit.organisationUnitCode),
        orgUnit.organisationUnitCode,
      ),
    );
  },
);

const selectMeasuresWithDisplayAndOrgUnitData = createSelector(
  [
    state => selectCountryHierarchy(state, state.map.currentCountry),
    selectMeasuresWithDisplayInfo,
    state => selectCountriesAsOrgUnits(state),
  ],
  (country, measureData, countries) => {
    const type = country && country[country.countryCode]?.type;

    if (type === 'Project') {
      return measureData.map(data => {
        const countryData = countries.find(
          c => c.organisationUnitCode === data.organisationUnitCode,
        );
        return {
          ...data,
          ...countryData,
        };
      });
    }

    return measureData.map(data => ({
      ...data,
      ...getOrgUnitFromCountry(country, data.organisationUnitCode),
    }));
  },
);

const selectDisplayLevelAncestor = createSelector(
  [
    state => selectCountryHierarchy(state, selectCurrentOrgUnitCode(state)),
    selectCurrentOrgUnitCode,
    state => selectMeasureOptions(state, state.map.displayedMapOverlays),
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

export const selectRenderedMeasuresWithDisplayInfo = createSelector(
  [
    state => selectCountryHierarchy(state, selectCurrentOrgUnitCode(state)),
    selectMeasuresWithDisplayAndOrgUnitData,
    selectDisplayLevelAncestor,
    selectMeasureOptions,
  ],
  (country, measures, displaylevelAncestor, measureOptions = []) => {
    const displayOnLevel = measureOptions.map(option => option.displayOnLevel).find(level => level);

    if (!displayOnLevel) {
      return measures;
    }

    if (!displaylevelAncestor) {
      return [];
    }

    const allDescendantCodesOfAncestor = selectDescendantsFromCache(
      country,
      displaylevelAncestor.organisationUnitCode,
    ).map(descendant => descendant.organisationUnitCode);

    return measures.filter(measure =>
      allDescendantCodesOfAncestor.includes(measure.organisationUnitCode),
    );
  },
);

export const selectAreMeasuresOnTheSameEntityLevel = createSelector(
  [state => state.map.measureInfo],
  measureInfo => {
    if (!measureInfo) {
      return false;
    }
    const measureLevelsFromMeasures = Object.values(measureInfo)
      .map(({ measureLevel }) => measureLevel)
      .flat();
    const measureLevelSet = new Set(measureLevelsFromMeasures);
    return measureLevelSet.size !== measureLevelsFromMeasures.length;
  },
);
