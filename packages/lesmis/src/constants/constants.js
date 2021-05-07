/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

// Project Data Constants
export const PROJECT_CODE = 'laos_schools';
export const COUNTRY_CODE = 'LA';

// Date Constants
export const SINGLE_YEAR_GRANULARITY = 'one_year_at_a_time';
export const MIN_DATA_DATE = '20150101';
export const MIN_DATA_YEAR = '2015';
export const DEFAULT_DATA_YEAR = '2020';

// Layout Constants
export const NAVBAR_HEIGHT = '70px';
export const FOOTER_HEIGHT = '48px';

// Map Constants
export const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

export const TILE_SETS = [
  {
    key: 'osm',
    label: 'Open Streets',
    thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
  },
];
