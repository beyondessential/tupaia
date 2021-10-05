/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export const getMapOverlaysFromHierarchy = (mapOverlayHierarchy, targetMapOverlayIds) => {
  if (!targetMapOverlayIds) {
    return [];
  }

  return flattenMapOverlayHierarchy(mapOverlayHierarchy).filter(({ mapOverlayId }) =>
    targetMapOverlayIds.includes(mapOverlayId),
  );
};

export const checkHierarchyIncludesMapOverlayIds = (mapOverlayHierarchy, targetMapOverlayIds) => {
  if (!targetMapOverlayIds || targetMapOverlayIds?.length === 0) {
    return false;
  }
  const { length: resultLength } = getMapOverlaysFromHierarchy(
    mapOverlayHierarchy,
    targetMapOverlayIds,
  );
  return resultLength === targetMapOverlayIds.length;
};

export function flattenMapOverlayHierarchy(mapOverlayHierarchy) {
  const results = [];
  const flattenGroupedMeasure = ({ children }) => {
    children.forEach(childObject => {
      if (childObject.children && childObject.children.length) {
        flattenGroupedMeasure(childObject);
      } else {
        results.push(childObject);
      }
    });
  };
  mapOverlayHierarchy.forEach(measure => {
    if (measure.children) {
      flattenGroupedMeasure(measure);
    } else {
      results.push(measure);
    }
  });

  return results;
}

export const isMapOverlayHierarchyEmpty = mapOverlayHierarchy =>
  flattenMapOverlayHierarchy(mapOverlayHierarchy).length === 0;

export const sortMapOverlayIdsByHierarchyOrder = (mapOverlayHierarchy, mapOverlayIds) => {
  const hierarchyMapOverlayIds = flattenMapOverlayHierarchy(mapOverlayHierarchy).map(
    overlay => overlay.mapOverlayId,
  );
  return mapOverlayIds.sort(
    (a, b) =>
      hierarchyMapOverlayIds.findIndex(overlayId => overlayId === a) -
      hierarchyMapOverlayIds.findIndex(overlayId => overlayId === b),
  );
};
