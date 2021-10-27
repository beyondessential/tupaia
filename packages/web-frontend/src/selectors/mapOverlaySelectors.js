/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';
import { DEFAULT_MAP_OVERLAY_ID } from '../defaults';
import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import {
  getMapOverlaysFromHierarchy,
  flattenMapOverlayHierarchy,
  isMapOverlayHierarchyEmpty,
  checkHierarchyIncludesMapOverlayCodes,
} from '../utils';

import { selectCurrentProject } from './projectSelectors';
import { selectLocation } from './utils';

export const selectMapOverlayByCodes = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, codes) => codes],
  getMapOverlaysFromHierarchy,
);

export const selectMapOverlayByCode = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, code) => code],
  (mapOverlayHierarchy, mapOverlayCode) => {
    const result = getMapOverlaysFromHierarchy(mapOverlayHierarchy, [mapOverlayCode]);
    return result[0];
  },
);

export const selectCurrentMapOverlayCodes = createSelector([selectLocation], location => {
  const mapOverlayCodesInUrl = getLocationComponentValue(location, URL_COMPONENTS.MAP_OVERLAY);
  return mapOverlayCodesInUrl ? mapOverlayCodesInUrl.split(',') : [];
});

export const selectCurrentMapOverlayPeriods = createSelector([selectLocation], location => {
  const mapOverlayPeriodsInUrl = getLocationComponentValue(location, URL_COMPONENTS.OVERLAY_PERIOD);
  return mapOverlayPeriodsInUrl ? mapOverlayPeriodsInUrl.split(',') : [];
});

export const selectCurrentMapOverlays = createSelector(
  [state => state, selectCurrentMapOverlayCodes],
  selectMapOverlayByCodes,
);

export const selectDefaultMapOverlayCode = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, selectCurrentProject],
  (mapOverlayHierarchy, project) => {
    const projectMeasureCode = project.defaultMeasure;
    const measureIsDefined = code =>
      checkHierarchyIncludesMapOverlayCodes(mapOverlayHierarchy, [code]);

    if (measureIsDefined(projectMeasureCode)) return projectMeasureCode;
    if (measureIsDefined(DEFAULT_MAP_OVERLAY_ID)) return DEFAULT_MAP_OVERLAY_ID;
    if (!isMapOverlayHierarchyEmpty(mapOverlayHierarchy)) {
      return flattenMapOverlayHierarchy(mapOverlayHierarchy)[0].mapOverlayCode;
    }

    return DEFAULT_MAP_OVERLAY_ID;
  },
);

export const selectDefaultMapOverlay = createSelector(
  [state => state, state => selectDefaultMapOverlayCode(state)],
  (state, defaultMapOverlayCode) => {
    return selectMapOverlayByCode(state, defaultMapOverlayCode);
  },
);

export const selectPeriodGranularityByCode = createSelector(
  [selectMapOverlayByCode],
  mapOverlay => mapOverlay?.periodGranularity,
);

export const selectMapOverlayGroupByCode = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, code) => code],
  (mapOverlayHierarchy, code) => {
    let mapOverlayGroup = {};

    mapOverlayHierarchy.forEach(({ name, children }, groupIndex) => {
      const selectedMapOverlayIndex = children.findIndex(
        mapOverlay => mapOverlay.mapOverlayCode === code,
      );
      if (selectedMapOverlayIndex > -1) {
        mapOverlayGroup = {
          name,
          groupIndex,
          mapOverlayGroupIndex: selectedMapOverlayIndex,
          mapOverlay: children[selectedMapOverlayIndex],
        };
      }
    });

    return mapOverlayGroup;
  },
);
