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
import { selectCurrentOrgUnit } from './orgUnitSelectors';
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

export const selectHasMapOverlays = createSelector(
  [state => state.mapOverlayBar.mapOverlayHierarchy],
  mapOverlayHierarchy => mapOverlayHierarchy.length > 0,
);

export const selectMapOverlayEmptyMessage = createSelector(
  [selectHasMapOverlays, selectCurrentMapOverlays, selectCurrentOrgUnit],
  (hasMapOverlays, currentMapOverlays, orgUnit) => {
    if (!hasMapOverlays) {
      const orgName = orgUnit?.name || 'Your current selection';
      return `Select an area with valid data. ${orgName} has no map overlays available.`;
    }

    if (currentMapOverlays.length === 0) {
      return 'No map overlay selected';
    }

    return null;
  },
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

export const selectPeriodGranularityByCode = createSelector(
  [selectMapOverlayByCode],
  mapOverlay => mapOverlay?.periodGranularity,
);
