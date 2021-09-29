/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export const getMapOverlaysFromHierarchy = (mapOverlayHierarchy, targetMapOverlayIds) => {
  if (!targetMapOverlayIds) {
    return null;
  }

  const flattenMapOverlays = flattenMapOverlayHierarchy(mapOverlayHierarchy);
  const targettedMapOverlays = flattenMapOverlays.filter(({ mapOverlayId }) =>
    targetMapOverlayIds.includes(mapOverlayId),
  );

  return targettedMapOverlays.length === 0 ? null : targettedMapOverlays;
};

export const checkIfMapOverlayIdsInHierarchy = (mapOverlayHierarchy, targetMapOverlayIds) => {
  if (!targetMapOverlayIds || targetMapOverlayIds?.length === 0) {
    return false;
  }
  for (const id of targetMapOverlayIds) {
    if (!getMapOverlaysFromHierarchy(mapOverlayHierarchy, [id])) {
      return false;
    }
  }
  return true;
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
  const flattenMapOverlayIds = flattenMapOverlayHierarchy(mapOverlayHierarchy).map(
    overlay => overlay.mapOverlayId,
  );
  return mapOverlayIds.sort(
    (a, b) =>
      flattenMapOverlayIds.findIndex(overlayId => overlayId === a) -
      flattenMapOverlayIds.findIndex(overlayId => overlayId === b),
  );
};
