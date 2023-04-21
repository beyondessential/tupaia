/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

const makeMapboxStyleUrl = ({ styleId, accessKey = MAPBOX_TOKEN, username = 'sussol' }) =>
  `https://api.mapbox.com/styles/v1/${username}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${accessKey}`;

const urls = {
  osm: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
  waterways: makeMapboxStyleUrl({ styleId: 'ckglkjbtq02t919nytx6yaopk' }),
  roads: makeMapboxStyleUrl({ styleId: 'ckglkibqe02u019rsdszxsxrr' }),
  ethnicity: makeMapboxStyleUrl({ styleId: 'ckh14lmqg02v819nfa7y14xvy' }),
  terrain: makeMapboxStyleUrl({ styleId: 'ckglkirqa02ty19tb3kzky18t' }),
  population: makeMapboxStyleUrl({ styleId: 'ckhmxvdza02m919tfa95rsfyh' }),
  // Laos EOC project
  laosOpenStreets: makeMapboxStyleUrl({ styleId: 'ckn9vp2ge1csu17moehpyw1tf' }),
  laosSatellite: makeMapboxStyleUrl({ styleId: 'ckma1ax5u4yyi17o7k01f7k2h' }),
  laosWaterways: makeMapboxStyleUrl({ styleId: 'ckm5nzs0g0ikm17k6tp7d50kd' }),
  laosRoads: makeMapboxStyleUrl({ styleId: 'ckm5o3b9c82li17r166w0bj2g' }),
  laosEthnicity: makeMapboxStyleUrl({ styleId: 'ckm5nv5rv82j217qka0kylmsu' }),
  laosTerrain: makeMapboxStyleUrl({ styleId: 'ckm5o375h43a017qym8ic3sgh' }),
  laosPopulation: makeMapboxStyleUrl({ styleId: 'ckm5nolwx0pkt17o7vvgnuya0' }),
  // UNFPA
  unfpaPopulation: makeMapboxStyleUrl({ styleId: 'cl5w14no4001m14qyaermcomc' }),
};

const openStreets = key => ({
  key,
  label: 'Open Streets',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
  url: urls[key],
});
const satellite = key => ({
  key,
  label: 'Satellite',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
  url: urls[key],
});
const waterways = key => ({
  key,
  label: 'Waterways',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/waterways-tile-thumbnail.png',
  url: urls[key],
});
const roads = key => ({
  key,
  label: 'Roads',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/roads-tile-thumbnail.png',
  url: urls[key],
});
const ethnicity = key => ({
  key,
  label: 'Ethnicity',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/ethnicity-tile-thumbnail.png',
  url: urls[key],
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
  reference: {
    name: 'opendevelopmentmekong',
    link: 'https://data.opendevelopmentmekong.net/dataset/geo-referencing-of-ethnic-groups-of-laos?type=dataset',
  },
});
const terrain = key => ({
  key,
  label: 'Terrain',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/terrain-tile-thumbnail.png',
  url: urls[key],
});
const population = key => ({
  key,
  label: 'Population',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/population-tile-thumbnail.png',
  url: urls[key],
  reference: {
    name: 'worldpop',
    link: 'https://www.worldpop.org/geodata/listing?id=69',
  },
});
const unfpaPopulation = key => ({
  key,
  label: 'Population per 1km',
  thumbnail:
    'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/unfpa-population-tile-thumbnail.png',
  url: urls[key],
});

export const TILE_SETS = [
  openStreets('osm'),
  satellite('satellite'),
  waterways('waterways'),
  roads('roads'),
  ethnicity('ethnicity'),
  terrain('terrain'),
  population('population'),
  // Laos EOC project
  openStreets('laosOpenStreets'),
  satellite('laosSatellite'),
  waterways('laosWaterways'),
  roads('laosRoads'),
  ethnicity('laosEthnicity'),
  terrain('laosTerrain'),
  population('laosPopulation'),
  // UNFPA
  unfpaPopulation('unfpaPopulation'),
];
