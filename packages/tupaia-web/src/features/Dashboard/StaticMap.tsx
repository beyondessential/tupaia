import polyline from '@mapbox/polyline';
import type { Position } from 'geojson';
import { LatLngBoundsLiteral } from 'leaflet';
import React from 'react';
import styled from 'styled-components';

import { DEFAULT_BOUNDS, MOBILE_BREAKPOINT } from '../../constants';
import { Entity } from '../../types';
import { Media } from './Media';

type EntityBounds = Entity['bounds'];

const Wrapper = styled.div`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;
const areBoundsValid = (b: EntityBounds) => {
  return Array.isArray(b) && b.length === 2;
};

const getBoundingPoint = (coords: Position) => {
  const min = Math.min(...coords);
  const max = Math.max(...coords);
  return min + (max - min) / 2;
};

const getLatLongForBounds = (polygonPoints: LatLngBoundsLiteral) => {
  const lats = polygonPoints.map(latLong => latLong[0]);
  const longs = polygonPoints.map(latLong => latLong[1]);

  const latitude = getBoundingPoint(lats);
  // Mapbox static api throws errors with anything over 180.
  const longitude = Math.min(getBoundingPoint(longs), 180);

  return { latitude, longitude };
};

const MAPBOX_TOKEN = import.meta.env.REACT_APP_MAPBOX_TOKEN;
const MAPBOX_BASE_ORIGIN = 'https://api.mapbox.com';
const MAPBOX_BASE_PATHNAME = '/styles/v1/sussol/cj64gthqq297z2so13qljil5n/static';

const makeStaticMapUrl = (polygonBounds: EntityBounds) => {
  if (!polygonBounds) return '';
  const polygonPoints: LatLngBoundsLiteral = [
    [polygonBounds[1][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[1][1]],
  ];

  const encodedPolyline = encodeURIComponent(polyline.encode(polygonPoints));

  const hideBox = JSON.stringify(polygonBounds) === JSON.stringify(DEFAULT_BOUNDS);
  const boundingBoxPath = hideBox ? '' : `/path-4+ed6338-1(${encodedPolyline})`;

  // Render map at 2x for retina screens and also render at a larger size to allow for responsive screen widths.
  const isLowDpi = window.matchMedia('(max-resolution: 1dppx)').matches;
  const size = `660x400${isLowDpi ? '' : '@2x'}`;

  // Cannot use auto center and bounds for mapbox as it doesn't work over 160 degrees.
  const { latitude, longitude } = getLatLongForBounds(polygonPoints);
  const zoomLevel = longitude === 180 ? 1 : 2;
  const position = `${longitude},${latitude},${zoomLevel}`;

  const url = new URL(
    `${MAPBOX_BASE_PATHNAME}${boundingBoxPath}/${position}/${size}`,
    MAPBOX_BASE_ORIGIN,
  );
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('attribution', 'false');
  url.searchParams.set('logo', 'false');

  return url.toString();
};

interface StaticMapProps {
  title?: string;
  bounds: EntityBounds;
}

// default bounds to be DEFAULT_BOUNDS so that something shows while loading the entity, reducing largest contentful paint speeds
export const StaticMap = ({ bounds = DEFAULT_BOUNDS as EntityBounds, title }: StaticMapProps) => {
  if (!areBoundsValid(bounds)) {
    return null;
  }

  const url = makeStaticMapUrl(bounds);
  return (
    <Wrapper>
      <Media $backgroundImage={url} aria-label={`Static map image for ${title}`} />
    </Wrapper>
  );
};
