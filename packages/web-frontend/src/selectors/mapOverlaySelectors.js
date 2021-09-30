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

export const selectMapOverlayById = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, id) => id],
  (mapOverlayHierarchy, id) => {
    return getMapOverlayFromHierarchy(mapOverlayHierarchy, id);
  },
);

export const selectCurrentMapOverlayId = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.MAP_OVERLAY),
);

export const selectCurrentMapOverlay = createSelector(
  [state => selectMapOverlayById(state, selectCurrentMapOverlayId(state))],
  currentMapOverlay => currentMapOverlay,
);

export const selectIsMapOverlayInHierarchy = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, id) => id],
  (mapOverlayHierarchy, id) => !!getMapOverlayFromHierarchy(mapOverlayHierarchy, id),
);

export const selectDefaultMapOverlayId = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, selectCurrentProject],
  (mapOverlayHierarchy, project) => {
    const projectMeasureId = project.defaultMeasure;
    const measureIsDefined = id => !!getMapOverlayFromHierarchy(mapOverlayHierarchy, id);

    if (measureIsDefined(projectMeasureId)) return projectMeasureId;
    if (measureIsDefined(DEFAULT_MAP_OVERLAY_ID)) return DEFAULT_MAP_OVERLAY_ID;
    if (!isMapOverlayHierarchyEmpty(mapOverlayHierarchy)) {
      return flattenMapOverlayHierarchy(mapOverlayHierarchy)[0].mapOverlayId;
    }

    return DEFAULT_MAP_OVERLAY_ID;
  },
);

export const selectCurrentPeriodGranularity = createSelector(
  [selectCurrentMapOverlay],
  mapOverlay => mapOverlay.periodGranularity,
);

export const selectMapOverlayGroupById = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, id) => id],
  (mapOverlayHierarchy, id) => {
    let mapOverlayGroup = {};

    mapOverlayHierarchy.forEach(({ name, children }, groupIndex) => {
      const selectedMapOverlayIndex = children.findIndex(
        mapOverlay => mapOverlay.mapOverlayId === id,
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
