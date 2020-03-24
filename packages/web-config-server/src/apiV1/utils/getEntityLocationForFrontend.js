/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {
  translateBoundsForFrontend,
  translatePointForFrontend,
  translateRegionForFrontend,
} from '/utils/geoJson';

export function getEntityLocationForFrontend({ point, region, bounds }) {
  const type = (() => {
    if (region) return 'area';
    if (point) return 'point';
    return 'no-coordinates';
  })();

  return {
    type,
    point: translatePointForFrontend(point),
    bounds: translateBoundsForFrontend(bounds),
    region: translateRegionForFrontend(region),
  };
}
