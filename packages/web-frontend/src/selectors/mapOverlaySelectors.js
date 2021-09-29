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
  mapOverlayIdsAreInHierarchy,
} from '../utils';

import { selectCurrentProject } from './projectSelectors';
import { selectLocation } from './utils';

export const selectMapOverlayByIds = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, ids) => ids],
  (mapOverlayHierarchy, ids) => {
    return getMapOverlaysFromHierarchy(mapOverlayHierarchy, ids);
  },
);

export const selectMapOverlayById = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, (_, id) => id],
  (mapOverlayHierarchy, id) => {
    const result = getMapOverlaysFromHierarchy(mapOverlayHierarchy, [id]);
    return result[0];
  },
);

export const selectCurrentMapOverlayIds = createSelector([selectLocation], location => {
  const mapOverlayIdsInString = getLocationComponentValue(location, URL_COMPONENTS.MAP_OVERLAY);
  return mapOverlayIdsInString ? mapOverlayIdsInString.split(',') : [];
});

export const selectCurrentMapOverlays = createSelector(
  [state => selectMapOverlayByIds(state, selectCurrentMapOverlayIds(state))],
  currentMapOverlays => currentMapOverlays,
);

export const selectDefaultMapOverlayId = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy, selectCurrentProject],
  (mapOverlayHierarchy, project) => {
    const projectMeasureId = project.defaultMeasure;
    const measureIsDefined = id => mapOverlayIdsAreInHierarchy(mapOverlayHierarchy, [id]);

    if (measureIsDefined(projectMeasureId)) return projectMeasureId;
    if (measureIsDefined(DEFAULT_MAP_OVERLAY_ID)) return DEFAULT_MAP_OVERLAY_ID;
    if (!isMapOverlayHierarchyEmpty(mapOverlayHierarchy)) {
      return flattenMapOverlayHierarchy(mapOverlayHierarchy)[0].mapOverlayId;
    }

    return DEFAULT_MAP_OVERLAY_ID;
  },
);

export const selectDefaultMapOverlay = createSelector(
  [state => state, state => selectDefaultMapOverlayId(state)],
  (state, defaultMapOverlayId) => {
    return selectMapOverlayById(state, defaultMapOverlayId);
  },
);

export const selectCurrentPeriodGranularity = createSelector(
  [selectCurrentMapOverlays],
  // TODO: PHX-1 set multiple overlay period in URL, currently use the first selected map overlay
  mapOverlays => mapOverlays[0]?.periodGranularity,
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
