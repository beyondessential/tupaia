import { COLUMNS as ENTITIES_COLUMNS } from './entities';

const RESOURCE_NAME = { singular: 'country', plural: 'countries' };

const FIELDS = [
  { source: 'id', show: false },
  {
    Header: 'Name',
    source: 'name',
    required: true,
  },
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'countries',
    fields: FIELDS,
  },
};

export const countries = {
  resourceName: RESOURCE_NAME,
  endpoint: 'countries',
  path: '/countries',
  columns: FIELDS,
  createConfig: CREATE_CONFIG,
  needsBESAdminAccess: ['create'],
  nestedViews: [
    {
      title: 'Entities',
      endpoint: 'countries/{id}/entities',
      columns: ENTITIES_COLUMNS,
      path: '/:id/entities',
      displayProperty: 'name',
    },
  ],
};
