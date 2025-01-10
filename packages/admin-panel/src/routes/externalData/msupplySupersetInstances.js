const RESOURCE_NAME = { singular: 'superset instance' };

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    required: true,
    editConfig: {
      type: 'jsonEditor',
      default: '{}',
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'supersetInstances',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: `supersetInstances`,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'supersetInstances',
    fields: FIELDS,
  },
};

export const supersetInstances = {
  title: 'mSupply superset instances',
  endpoint: 'supersetInstances',
  resourceName: RESOURCE_NAME,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  path: '/superset-instances',
};
