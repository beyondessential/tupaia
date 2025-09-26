const RESOURCE_NAME = { singular: 'entity type' };

const ENTITY_TYPES_ENDPOINT = 'entityTypes';

export const ENTITY_TYPES_COLUMNS = [
  { source: 'id', show: false },
  {
    Header: 'Type',
    source: 'type',
    filterable: false,
    disableSortBy: true,
  },
];

const CREATE_CONFIG = {
  title: 'Add a new entity type',
  actionConfig: {
    editEndpoint: ENTITY_TYPES_ENDPOINT,
    fields: [
      {
        Header: 'Type',
        source: 'type',
      },
    ],
  },
};

export const entityTypes = {
  resourceName: RESOURCE_NAME,
  path: '/entityTypes',
  endpoint: ENTITY_TYPES_ENDPOINT,
  columns: ENTITY_TYPES_COLUMNS,
  createConfig: CREATE_CONFIG,
};
