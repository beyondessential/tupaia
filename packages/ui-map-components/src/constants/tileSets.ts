export const DEFAULT_TILESETS = {
  osm: {
    key: 'osm',
    label: 'Open Streets',
    thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  satellite: {
    key: 'satellite',
    label: 'Satellite',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`,
  },
};

/** Utility function to determine whether tileSet should default to satellite
 * or to osm, based on page load time. This will only run when determining the
 * initial state of the map.
 */
export const getAutoTileSet = () => {
  // default to osm in dev so that we don't pay for tiles when running locally
  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_TILESETS.osm;
  } else {
    const SLOW_LOAD_TIME_THRESHOLD = 2 * 1000; // 2 seconds in milliseconds
    return (
      window as unknown as Window & {
        loadTime: number;
      }
    )?.loadTime < SLOW_LOAD_TIME_THRESHOLD
      ? DEFAULT_TILESETS.satellite
      : DEFAULT_TILESETS.osm;
  }
};
