/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { MapOverlayGroup, MapOverlayType } from '../types';

export function flattenMapOverlays(mapOverlayGroups: MapOverlayGroup[]) {
  return mapOverlayGroups.reduce((result: MapOverlayType[], mapOverlayGroup: MapOverlayGroup) => {
    return [...result, ...mapOverlayGroup.children];
  }, []);
}
