/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

const makeMapboxStyleUrl = ({ styleId, accessKey = MAPBOX_TOKEN, username = 'sussol' }) =>
  `https://api.mapbox.com/styles/v1/${username}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${accessKey}`;

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
  {
    key: 'waterways',
    label: 'Waterways',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/waterways-tile-thumbnail.png',
    url: makeMapboxStyleUrl({ styleId: 'ckglkjbtq02t919nytx6yaopk' }),
  },
  {
    key: 'roads',
    label: 'Roads',
    thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/roads-tile-thumbnail.png',
    url: makeMapboxStyleUrl({ styleId: 'ckglkibqe02u019rsdszxsxrr' }),
  },
  {
    key: 'ethnicity',
    label: 'Ethnicity',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/ethnicity-tile-thumbnail.png',
    url: makeMapboxStyleUrl({
      styleId: 'ckh14lmqg02v819nfa7y14xvy',
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
    thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/terrain-tile-thumbnail.png',
    url: makeMapboxStyleUrl({ styleId: 'ckglkirqa02ty19tb3kzky18t' }),
  },
  {
    key: 'population',
    label: 'Population',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/population-tile-thumbnail.png',
    url: makeMapboxStyleUrl({ styleId: 'ckhmxvdza02m919tfa95rsfyh' }),
  },
];
