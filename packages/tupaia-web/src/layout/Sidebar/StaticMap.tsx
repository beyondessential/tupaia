/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import polyline from '@mapbox/polyline';
import { Position } from 'geojson';
import { DEFAULT_BOUNDS, TRANSPARENT_BLACK } from '../../constants';
import styled from 'styled-components';

const areBoundsValid = (b: Position[]) => {
  return Array.isArray(b) && b.length === 2;
};

const getLatLongForBounds = (bounds: Position[]) => {
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

const MAPBOX_TOKEN = import.meta.env.REACT_APP_MAPBOX_TOKEN;
const MAPBOX_BASE_URL = 'https://api.mapbox.com/styles/v1/sussol/cj64gthqq297z2so13qljil5n/static';

const makeStaticMapUrl = (polygonBounds: Position[]) => {
  const polygonPoints = [
    [polygonBounds[1][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[1][1]],
  ];

  const encodedPolyline = encodeURIComponent(
    polyline.encode(polygonPoints as Array<[number, number]>),
  );

  const showBox = polygonBounds !== DEFAULT_BOUNDS;
  const polygonParams = showBox ? `/path-4+ed6338-1(${encodedPolyline})` : '';

  // Render map at 2x for retina screens and also render at a larger size to allow for responsive screen widths.
  const width = 660;
  const height = 400;
  const size = `${width}x${height}`;

  // Cannot use auto center and bounds for mapbox as it doesn't work over 160 degrees.
  const { latitude, longitude } = getLatLongForBounds(polygonPoints);

  const zoomLevel = longitude === 180 ? 1 : 2;

  return `${MAPBOX_BASE_URL}${polygonParams}/${longitude},${latitude},${zoomLevel}/${size}@2x?access_token=${MAPBOX_TOKEN}&attribution=false`;
};

const StyledImage = styled.div<{
  $backgroundImage?: string;
}>`
  min-height: 200px;
  padding-bottom: 25%;
  background-image: ${({ $backgroundImage }) => `url("${$backgroundImage}")`};
  background-size: cover;
  background-position: center;
  background-color: ${TRANSPARENT_BLACK};
`;

export const StaticMap = ({ polygonBounds }: { polygonBounds: Position[] }) => {
  if (!areBoundsValid(polygonBounds)) {
    return null;
  }

  const url = makeStaticMapUrl(polygonBounds);
  return <StyledImage $backgroundImage={url} />;
};
