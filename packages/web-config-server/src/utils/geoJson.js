// TODO: the server should probably return geometry data just in geojson format and
// leave it up to frontend to handle that correctly

// swap from lng lat to lat lng and keep longitude within [0, 360)
function flipLatLng(coord) {
  const [lng, lat] = coord;
  return [lat, (360 + lng) % 360];
}

function flipLatLngRecursive(coords) {
  if (typeof coords[0] === 'number') {
    return flipLatLng(coords);
  }

  return coords.map(flipLatLngRecursive);
}

// Swap from geojson point to [lat, lng]
export function translatePointForFrontend(point) {
  if (!point) return null;
  const data = JSON.parse(point);
  return flipLatLng(data.coordinates);
}

// Swap from geojson polygon to [[lat, lng], [lat, lng]]
export function translateBoundsForFrontend(bounds) {
  if (!bounds) return null;
  const data = JSON.parse(bounds);
  const box = data.coordinates[0];
  if (!box) return null;

  const [topLeft, _, bottomRight] = box;
  return [flipLatLng(topLeft), flipLatLng(bottomRight)];
}

// Recursively swap from geojson multi-polygon to [[[lat, lng], [lat, lng]]]
export function translateRegionForFrontend(region) {
  if (!region) return null;

  const data = JSON.parse(region);
  if (data.type !== 'MultiPolygon') return null;

  // need to recurse into data structure and flip all coordinate arrays
  return flipLatLngRecursive(data.coordinates);
}

// Calculates the largest bounding box from a list of entities with bounds.
export const calculateBoundsFromEntities = entities => {
  const bounds = entities.map(entity => translateBoundsForFrontend(entity.bounds)).filter(x => x);
  if (bounds.length === 0) {
    return null;
  }

  return [
    [
      // topLeft
      Math.max(...bounds.map(b => b[0][0])),
      Math.min(...bounds.map(b => b[0][1])),
    ],
    [
      // bottomRight
      Math.min(...bounds.map(b => b[1][0])),
      Math.max(...bounds.map(b => b[1][1])),
    ],
  ];
};
