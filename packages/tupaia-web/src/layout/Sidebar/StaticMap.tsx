/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import polyline from '@mapbox/polyline';
import { DEFAULT_BOUNDS } from '../../constants';

const MAPBOX_TOKEN = import.meta.env.REACT_APP_MAPBOX_TOKEN;

const mapboxBaseUrl = 'https://api.mapbox.com/styles/v1/sussol/cj64gthqq297z2so13qljil5n/static';

function areBoundsValid(b) {
  return Array.isArray(b) && b.length === 2;
}

const getLatLongForBounds = bounds => {
  const lats = bounds.map(latLong => latLong[0]);
  const longs = bounds.map(latLong => latLong[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLong = Math.min(...longs);
  const maxLong = Math.max(...longs);

  const latitude = minLat + (maxLat - minLat) / 2;

  let longitude = minLong + (maxLong - minLong) / 2;

  // Mapbox static api throws errors with anything over 180.
  longitude = longitude > 180 ? 180 : longitude;

  return { latitude, longitude };
};

export const StaticMap = ({ polygonBounds = DEFAULT_BOUNDS }) => {
  if (!areBoundsValid(polygonBounds)) return null;

  const showBox = polygonBounds !== DEFAULT_BOUNDS;

  const polygonPoints = [
    [polygonBounds[1][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[1][1]],
  ];

  const encodedPolyline = encodeURIComponent(polyline.encode(polygonPoints));

  const polygonParams = showBox ? `/path-5+ed6338-1(${encodedPolyline})` : '';
  const width = 300;
  const height = 160;
  const size = `${width}x${height}`;

  // Cannot use auto center and bounds for mapbox as it doesn't work over 160 degrees.
  const { latitude, longitude } = getLatLongForBounds(polygonPoints);

  const zoomLevel = longitude === 180 ? 1 : 1;
  const position = `${longitude},${latitude},${zoomLevel}`;

  const url = `${mapboxBaseUrl}${polygonParams}/${position}/${size}?access_token=${MAPBOX_TOKEN}&attribution=false`;

  return <img src={url} alt="static-map" width={width} height={height} />;
};
