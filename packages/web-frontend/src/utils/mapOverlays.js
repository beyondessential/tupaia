/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { flattenMapOverlayHierarchy } from './measures';

export const getMapOverlayFromHierarchy = (mapOverlayHierarchy, targetMapOverlayId) => {
  if (!targetMapOverlayId) {
    return null;
  }

  const flattenMapOverlays = flattenMapOverlayHierarchy(mapOverlayHierarchy);
  return flattenMapOverlays.find(({ mapOverlayId }) => targetMapOverlayId === mapOverlayId);
};

export const getMeasureIdsByMapOverlayIds = (mapOverlayHierarchy, targetMapOverlayIds) => {
  if (!targetMapOverlayIds) {
    return null;
  }
  const flattenMapOverlays = flattenMapOverlayHierarchy(mapOverlayHierarchy);
  const measureIdsSet = new Set(
    flattenMapOverlays
      .filter(({ mapOverlayId }) => targetMapOverlayIds.includes(mapOverlayId))
      .flatMap(({ measureIds }) => measureIds),
  );
  return Array.from(measureIdsSet);
};
