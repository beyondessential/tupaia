/**
 * Tupaia Web
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';
import { DEFAULT_MEASURE_ID } from '../defaults';
import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { getMapOverlayFromHierarchy } from '../utils';
import { flattenMapOverlayHierarchy, isMeasureHierarchyEmpty } from '../utils/measures';

import { selectCurrentProject } from './projectSelectors';
import { selectLocation } from './utils';

export const selectMapOverlayById = createSelector(
  [state => state.measureBar.measureHierarchy, (_, id) => id],
  (measureHierarchy, id) => {
    return getMapOverlayFromHierarchy(measureHierarchy, id) || {};
  },
);

export const selectCurrentMapOverlayId = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.MAP_OVERLAY_IDS),
);

export const selectCurrentMapOverlay = createSelector(
  [state => selectMapOverlayById(state, selectCurrentMapOverlayId(state))],
  currentMapOverlay => currentMapOverlay || {},
);

export const selectIsMapOverlayInHierarchy = createSelector(
  [state => state.measureBar.measureHierarchy, (_, ids) => ids],
  (measureHierarchy, ids) => !!getMapOverlayFromHierarchy(measureHierarchy, ids),
);

export const selectDefaultMapOverlayId = createSelector(
  [state => state.measureBar.measureHierarchy, selectCurrentProject],
  (measureHierarchy, project) => {
    const projectMeasureId = project.defaultMeasure;
    const measureIsDefined = id => !!getMapOverlayFromHierarchy(measureHierarchy, id);

    if (measureIsDefined(projectMeasureId)) return projectMeasureId;
    if (measureIsDefined(DEFAULT_MEASURE_ID)) return DEFAULT_MEASURE_ID;
    if (!isMeasureHierarchyEmpty(measureHierarchy)) {
      return flattenMapOverlayHierarchy(measureHierarchy)[0].mapOverlayId;
    }

    return DEFAULT_MEASURE_ID;
  },
);

export const selectCurrentPeriodGranularity = createSelector(
  [selectCurrentMapOverlay],
  mapOverlay => mapOverlay.periodGranularity,
);

export const selectMeasureIdsByOverlayId = createSelector(
  [state => state, (_, mapOverlayId) => mapOverlayId],
  (state, mapOverlayId) => {
    const mapOverlay = selectMapOverlayById(state, mapOverlayId);
    return mapOverlay?.measureIds || null;
  },
);

export const selectMapOverlayGroupById = createSelector(
  [state => state.measureBar.measureHierarchy, (_, ids) => ids],
  (measureHierarchy, ids) => {
    let mapOverlayGroupIndex = {};

    measureHierarchy.forEach(({ name, children }, categoryIndex) => {
      const selectedMapOverlayGroupIndex = children.findIndex(
        mapOverlay => mapOverlay.mapOverlayId === ids,
      );
      if (selectedMapOverlayGroupIndex > -1) {
        mapOverlayGroupIndex = {
          name,
          categoryIndex,
          measureIndex: selectedMapOverlayGroupIndex,
          measure: children[selectedMapOverlayGroupIndex],
        };
      }
    });

    return mapOverlayGroupIndex;
  },
);
