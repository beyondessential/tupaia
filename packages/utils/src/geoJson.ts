/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

type Point = [number, number];

/**
 * swap from lng lat to lat lng and keep longitude within [0, 360]
 */
function flipLatLng(coords: Point): Point {
  const [lng, lat] = coords;
  return [lat, (360 + lng) % 360];
}

/**
 * Recursively calls flipLatLng
 * @param {any[]} coords
 * @returns {any[]}
 */
function flipLatLngRecursive(coords) {
  if (typeof coords[0] === 'number') {
    return flipLatLng(coords);
  }

  return coords.map(flipLatLngRecursive);
}

/**
 * Convert point geojson string into [lat, lng]
 */
export function translatePoint(pointGeoJsonString?: string) {
  if (!pointGeoJsonString) return null;
  const pointGeoJson = JSON.parse(pointGeoJsonString);
  return flipLatLng(pointGeoJson.coordinates);
}

/**
 * Convert bounds geojson string into [topLeft, bottomRight]
 */
export function translateBounds(boundsGeoJsonString?: string) {
  if (!boundsGeoJsonString) return null;
  const boundsGeoJson = JSON.parse(boundsGeoJsonString);
  const box = boundsGeoJson.coordinates[0];
  if (!box) return null;

  const [topLeft, _, bottomRight] = box;
  return [flipLatLng(topLeft), flipLatLng(bottomRight)];
}

/**
 * Convert region geojson string into [[[pointA, pointB, pointC, ...]]]
 */
export function translateRegion(regionGeoJsonString?: string) {
  if (!regionGeoJsonString) return null;

  const regionGeoJson = JSON.parse(regionGeoJsonString);
  if (regionGeoJson.type !== 'MultiPolygon') return null;

  // need to recurse into data structure and flip all coordinate arrays
  return flipLatLngRecursive(regionGeoJson.coordinates);
}

/**
 * Calculates the largest bounding box from a list of bounds.
 * @param {(string | null)[]} listOfBounds
 * Returns {[Point, Point] | null} [topLeft, bottomRight]
 */
// FIXME: what is null doing here
export const calculateOuterBounds = (listOfBounds: (string | null)[]): null | [Point, Point] => {
  const bounds = listOfBounds.map(translateBounds).filter(x => x !== null);
  if (bounds.length === 0) {
    return null;
  }

  const points = bounds.reduce((values, bound) => [...values, ...bound], []);

  return [
    [Math.min(...points.map(point => point[0])), Math.min(...points.map(point => point[1]))],
    [Math.max(...points.map(point => point[0])), Math.max(...points.map(point => point[1]))],
  ];
};
