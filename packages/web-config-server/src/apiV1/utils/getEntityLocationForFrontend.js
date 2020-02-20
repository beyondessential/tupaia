/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { translateBoundsForFrontend, translatePointForFrontend } from '/utils/geoJson';

export function getEntityLocationForFrontend({ point, has_region: hasRegion, region, bounds }) {
  const type = (() => {
    if (hasRegion || region) return 'area';
    if (point) return 'point';
    return 'no-coordinates';
  })();

  return {
    type,
    point: translatePointForFrontend(point),
    bounds: translateBoundsForFrontend(bounds),
  };
}
