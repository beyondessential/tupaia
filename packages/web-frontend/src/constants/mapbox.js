/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

const GERRY_ACCESS_KEY =
  'pk.eyJ1IjoiZ2VkY2tlbGx5IiwiYSI6ImNrY3BsZ2RwYTB3N20yc3FyaTZlNzhzNDUifQ.N61FIOcE-3RTksi9Tlm5ow#10.25/17.9782/102.6277';

const TOM_ACCESS_KEY =
  'pk.eyJ1IjoiY2FpZ2VydG9tIiwiYSI6ImNrN2luY3Q2NTBsczUzZXF2NzBjcDMyZnIifQ.5j-7bo9L6dzC0VGqeUmsmA';

const GERRY_USERNAME = 'gedckelly';

const TOM_USERNAME = 'caigertom';

const makeMapboxStyleUrl = ({ styleId, accessKey = GERRY_ACCESS_KEY, username = GERRY_USERNAME }) =>
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
    url: makeMapboxStyleUrl({ styleId: 'ckemdct811px619qklzgvvg53' }),
  },
  {
    key: 'roads',
    label: 'Roads',
    thumbnail: '/images/roads.png',
    url: makeMapboxStyleUrl({ styleId: 'ckenp4uq10dfq1anzert7iot7' }),
  },
  {
    key: 'ethnicity',
    label: 'Ethnicity',
    thumbnail: '/images/ethnicity.png',
    url: makeMapboxStyleUrl({
      styleId: 'ckexmd0e30lm619lxeu6za5yt',
      accessKey: TOM_ACCESS_KEY,
      username: TOM_USERNAME,
    }),
    legendItems: [
      {
        color: '#33a02c',
        label: 'Bo and So',
      },
      {
        color: '#617e3e',
        label: 'Boloven',
      },
      {
        color: '#e31a1c',
        label: 'Hani',
      },
      {
        color: '#fb9a99',
        label: 'Lahu',
      },
      {
        color: '#7db43a',
        label: 'Khmers',
      },
      {
        color: '#69b763',
        label: 'Khmu',
      },
      {
        color: '#c2d564',
        label: 'Kui',
      },
      {
        color: '#c9be77',
        label: 'Lamet',
      },
      {
        color: '#6b78d7',
        label: 'Lao',
      },
      {
        color: '#2196F3',
        label: 'Lu',
      },
      {
        color: '#ffaa00',
        label: 'Miao',
      },
      {
        color: '#89d730',
        label: 'Mnong and Brao',
      },
      {
        color: '#15d45b',
        label: 'Phuteng',
      },
      {
        color: '#e38083',
        label: 'Sedang',
      },
      {
        color: '#806dd5',
        label: 'Sui',
      },
      {
        color: '#9e74cb',
        label: 'Thai',
      },
      {
        color: '#c543e8',
        label: 'Vankieu',
      },
      {
        color: '#ffc041',
        label: 'Yao',
      },
      {
        color: '#ed8a66',
        label: 'Yuang',
      },
    ],
  },
  {
    key: 'terrain',
    label: 'Terrain',
    thumbnail: '/images/terrain.png',
    url: makeMapboxStyleUrl({ styleId: 'ckenu2thw0ibl1anzk5aarzu6' }),
  },
];
