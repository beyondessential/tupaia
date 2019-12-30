// TODO: the server should probably return geometry data just in geojson format and
// leave it up to frontend to handle that correctly

// swap from lng lat to lat lng and keep longitude within [0, 360)
export function flipLatLng(coord) {
  const [lng, lat] = coord;
  return [lat, (360 + lng) % 360];
}

// swap from geojson polygon to [[lat, lng], [lat, lng]]
export function translateBoundsForFrontend(bounds) {
  if (!bounds) return [];
  const data = JSON.parse(bounds);
  const box = data.coordinates[0];
  if (!box) return [];

  const [topLeft, _, bottomRight] = box; // eslint-disable-line no-unused-vars
  return [flipLatLng(topLeft), flipLatLng(bottomRight)];
}

// swap from geojson point to [lat, lng]
export function translatePointForFrontend(point) {
  if (!point) return null;
  const data = JSON.parse(point);
  return flipLatLng(data.coordinates);
}

// Calculates the largest bounding box from a list of entities with bounds.
export function calculateBoundsFromEntities(entities) {
  return entities.reduce((bounds, entity) => {
    const entityBounds = translateBoundsForFrontend(entity.bounds);
    if (!bounds) return entityBounds;

    const box = [...bounds];
    // topLeft
    if (box[0][0] < entityBounds[0][0]) box[0][0] = entityBounds[0][0];
    if (box[0][1] > entityBounds[0][1]) box[0][1] = entityBounds[0][1];
    // bottomRight
    if (box[1][0] > entityBounds[1][0]) box[1][0] = entityBounds[1][0];
    if (box[1][1] < entityBounds[1][1]) box[1][1] = entityBounds[1][1];

    return box;
  }, null);
}
