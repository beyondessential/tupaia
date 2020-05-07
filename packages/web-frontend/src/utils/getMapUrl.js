/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { getCenterAndZoomForBounds } from '.';

export const getMapUrl = orgUnit => {
  if (!orgUnit || !orgUnit.location) {
    return '';
  }

  let latitude;
  let longitude;
  let mapZoom;

  const { bounds } = orgUnit.location;
  if (bounds && bounds.length > 0) {
    const { center, zoom } = getCenterAndZoomForBounds({
      minLat: bounds[0][0],
      minLong: bounds[0][1],
      maxLat: bounds[1][0],
      maxLong: bounds[1][1],
    });

    latitude = center.latitude;
    longitude = center.longitude;
    mapZoom = zoom;
  } else if (orgUnit.location.coordinates) {
    latitude = orgUnit.location.coordinates[0];
    longitude = orgUnit.location.coordinates[1];
    mapZoom = 12;
  } else {
    return '';
  }

  return `https://maps.google.com/?q=${latitude},${longitude}+(${orgUnit.name})&ll=${latitude},${longitude}&z=${mapZoom}`;
};
