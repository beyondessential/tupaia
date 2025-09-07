const makeMapboxStyleUrl = ({
  styleId,
  accessKey = import.meta.env.REACT_APP_MAPBOX_TOKEN,
  username = 'sussol',
}) =>
  `https://api.mapbox.com/styles/v1/${username}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${accessKey}`;

const urls = {
  waterways: makeMapboxStyleUrl({ styleId: 'ckglkjbtq02t919nytx6yaopk' }),
  roads: makeMapboxStyleUrl({ styleId: 'ckglkibqe02u019rsdszxsxrr' }),
  ethnicity: makeMapboxStyleUrl({ styleId: 'ckh14lmqg02v819nfa7y14xvy' }),
  terrain: makeMapboxStyleUrl({ styleId: 'ckglkirqa02ty19tb3kzky18t' }),
  population: makeMapboxStyleUrl({ styleId: 'ckhmxvdza02m919tfa95rsfyh' }),
  // UNFPA
  unfpaPopulation: makeMapboxStyleUrl({ styleId: 'cl5w14no4001m14qyaermcomc' }),
};

const waterways = {
  key: 'waterways',
  label: 'Waterways',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/waterways-tile-thumbnail.png',
  url: urls.waterways,
};
const roads = {
  key: 'roads',
  label: 'Roads',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/roads-tile-thumbnail.png',
  url: urls.roads,
};
const ethnicity = {
  key: 'ethnicity',
  label: 'Ethnicity',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/ethnicity-tile-thumbnail.png',
  url: urls.ethnicity,
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
};
const terrain = {
  key: 'terrain',
  label: 'Terrain',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/terrain-tile-thumbnail.png',
  url: urls.terrain,
};
const population = {
  key: 'population',
  label: 'Population',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/population-tile-thumbnail.png',
  url: urls.population,
  reference: {
    name: 'worldpop',
    link: 'https://www.worldpop.org/geodata/listing?id=69',
  },
};
const unfpaPopulation = {
  key: 'unfpaPopulation',
  label: 'Population per 1km',
  thumbnail:
    'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/unfpa-population-tile-thumbnail.png',
  url: urls.unfpaPopulation,
};

export const CUSTOM_TILE_SETS = [
  waterways,
  roads,
  ethnicity,
  terrain,
  population,
  // UNFPA
  unfpaPopulation,
];

export { DEFAULT_BOUNDS } from '@tupaia/ui-map-components';
