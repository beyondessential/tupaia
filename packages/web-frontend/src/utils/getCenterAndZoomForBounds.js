/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

const zoomLevels = [
  360, 180, 90, 45, 22.5, 11.25, 5.625, 2.813, 1.406, 0.703, 0.352, 0.176, 0.088, 0.044, 0.022,
  0.011, 0.005, 0.003, 0.001,
];

export const getCenterAndZoomForBounds = bounds => {
  const { minLat, minLong, maxLat, maxLong } = bounds;

  const latDiff = maxLat - minLat;
  const longDiff = maxLong - minLong;

  const latitude = minLat + latDiff / 2;
  const longitude = minLong + longDiff / 2;
  let zoom = 0;

  for (let i = 0; i < zoomLevels.length; i++) {
    if (zoomLevels[i] > latDiff && zoomLevels[i] > longDiff) {
      zoom = i;
    } else {
      break;
    }
  }

  return {
    zoom,
    center: { latitude, longitude },
  };
};
