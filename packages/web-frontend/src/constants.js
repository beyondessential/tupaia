/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export const ENTITY_TYPE = {
  COUNTRY: 'Country',
  DISTRICT: 'District',
  SUB_DISTRICT: 'SubDistrict',
  FACILITY: 'Facility',
  DISASTER: 'Disaster',
};

export const SCALE_TYPES = {
  PERFORMANCE: 'performance',
  PERFORMANCE_DESC: 'performanceDesc',
  NEUTRAL: 'neutral',
  TIME: 'time',
};

export const MARKER_TYPES = {
  DOT_MARKER: 'dot',
  CIRCLE_MARKER: 'circle',
  CIRCLE_HEATMAP: 'circleHeatmap',
  SQUARE: 'square',
};

export const TUPAIA_LIGHT_LOGO_SRC = '/images/tupaia-logo-light.svg';

export const LOGIN_TYPES = {
  AUTO: 'auto',
  TOKEN: 'token',
  MANUAL: 'manual',
};

export const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

const GERRY_ACCESS_KEY =
  'pk.eyJ1IjoiZ2VkY2tlbGx5IiwiYSI6ImNrY3BsZ2RwYTB3N20yc3FyaTZlNzhzNDUifQ.N61FIOcE-3RTksi9Tlm5ow#10.25/17.9782/102.6277';

const GERRY_USERNAME = 'gedckelly';

const makeStyleUrl = ({ styleId, accessKey = GERRY_ACCESS_KEY, username = GERRY_USERNAME }) =>
  `https://api.mapbox.com/styles/v1/${username}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${accessKey}`;

export const TILE_SETS = [
  {
    key: 'osm',
    label: 'Open Streets',
    thumbnail: '/images/osm.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    thumbnail: '/images/satellite.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
  },
  {
    key: 'waterways',
    label: 'Waterways',
    thumbnail: '/images/waterways.png',
    url: makeStyleUrl({ styleId: 'ckemdct811px619qklzgvvg53' }),
  },
  {
    key: 'roads',
    label: 'Roads',
    thumbnail: '/images/roads.png',
    url: makeStyleUrl({ styleId: 'ckenp4uq10dfq1anzert7iot7' }),
    legendItems: [
      {
        color: '#D13333',
        label: 'Ethnic group one',
      },
      {
        color: '#E37F49',
        label: 'Ethnic group two',
      },
      {
        color: '#E12EC5',
        label: 'Ethnic group three',
      },
      {
        color: '#22D489',
        label: 'Ethnic group four',
      },
      {
        color: '#2196F3',
        label: 'Ethnic group five',
      },
    ],
  },
  {
    key: 'terrain',
    label: 'Terrain',
    thumbnail: '/images/terrain.png',
    url: makeStyleUrl({ styleId: 'ckenu2thw0ibl1anzk5aarzu6' }),
  },
];
