/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const openStreets = {
  key: 'osm',
  label: 'Open Streets',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
  url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
};
const satellite = {
  key: 'satellite',
  label: 'Satellite',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
  url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${
    import.meta.env.REACT_APP_MAPBOX_TOKEN
  }`,
};

export const TILE_SETS = [openStreets, satellite];
