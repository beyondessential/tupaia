const RESOURCE_NAME = { singular: 'DHIS instance' };

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Readonly',
    source: 'readonly',
    type: 'boolean',
    required: true,
    editConfig: {
      type: 'boolean',
    },
  },
  {
    Header: 'Config',
    source: 'config',
    required: true,
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
      default: '{}',
      required: true,
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
      editEndpoint: 'dhisInstances',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: `dhisInstances`,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'dhisInstances',
    fields: FIELDS,
  },
};

export const dhisInstances = {
  resourceName: RESOURCE_NAME,
  endpoint: 'dhisInstances',
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  path: '/dhis-instances',
};
