/**
 * Convert GeoJSON to front end coordinates
 * @param {String} point - the point to be parsed
 */

export const geoJsonToFrontEndCoordinates = point => {
  if (!point) {
    return [];
  }
  const [lng, lat] = JSON.parse(point).coordinates;
  const adjustedLng = (360 + lng) % 360; // ensure longitude is in [0, 360) range

  return [lat, adjustedLng]; // db stores (lng,lat) but frontend expects (lat,lng)
};
