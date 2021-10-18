/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';
import { DEFAULT_MAP_OVERLAY_ID } from '../defaults';
import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { getMapOverlayFromHierarchy } from '../utils';
import { flattenMapOverlayHierarchy, isMapOverlayHierarchyEmpty } from '../utils/mapOverlays';

import { selectCurrentProject } from './projectSelectors';
import { selectLocation } from './utils';

export const selectMapOverlayByCode = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, code) => code],
  (mapOverlayHierarchy, code) => {
    return getMapOverlayFromHierarchy(mapOverlayHierarchy, code);
  },
);

export const selectCurrentMapOverlayCode = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.MAP_OVERLAY),
);

export const selectCurrentMapOverlay = createSelector(
  [state => selectMapOverlayByCode(state, selectCurrentMapOverlayCode(state))],
  currentMapOverlay => currentMapOverlay,
);

export const selectIsMapOverlayInHierarchy = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, code) => code],
  (mapOverlayHierarchy, code) => !!getMapOverlayFromHierarchy(mapOverlayHierarchy, code),
);

export const selectDefaultMapOverlayCode = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, selectCurrentProject],
  (mapOverlayHierarchy, project) => {
    const projectMeasureCode = project.defaultMeasure;
    const measureIsDefined = code => !!getMapOverlayFromHierarchy(mapOverlayHierarchy, code);

    if (measureIsDefined(projectMeasureCode)) return projectMeasureCode;
    if (measureIsDefined(DEFAULT_MAP_OVERLAY_ID)) return DEFAULT_MAP_OVERLAY_ID;
    if (!isMapOverlayHierarchyEmpty(mapOverlayHierarchy)) {
      return flattenMapOverlayHierarchy(mapOverlayHierarchy)[0].mapOverlayCode;
    }

    return DEFAULT_MAP_OVERLAY_ID;
  },
);

export const selectCurrentPeriodGranularity = createSelector(
  [selectCurrentMapOverlay],
  mapOverlay => mapOverlay.periodGranularity,
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
