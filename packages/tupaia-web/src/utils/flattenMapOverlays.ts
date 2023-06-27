import { MapOverlayGroup, SingleMapOverlayItem } from '../types';

export const flattenMapOverlays = (mapOverlayGroups: MapOverlayGroup[]): SingleMapOverlayItem[] => {
  return mapOverlayGroups.reduce(
    (mapOverlays: SingleMapOverlayItem[], mapOverlayGroup: MapOverlayGroup) => {
      if (mapOverlayGroup.children)
        return [...mapOverlays, ...flattenMapOverlays(mapOverlayGroup.children)];
      return [...mapOverlays, mapOverlayGroup];
    },
    [],
  );
};
