const RESOURCE_NAME = { singular: 'indicator' };

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Builder',
    source: 'builder',
    required: true,
    editConfig: {
      optionsEndpoint: 'indicators',
      optionLabelKey: 'builder',
      optionValueKey: 'builder',
      sourceKey: 'builder',
      distinct: true,
    },
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
      default: '{ "formula": "", "aggregation": { "" : "" } }',
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    width: 70,
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'indicators',
      fields: [...FIELDS],
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'indicators',
    fields: FIELDS,
  },
};

export const indicators = {
  resourceName: RESOURCE_NAME,
  path: '/indicators',
  endpoint: 'indicators',
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  isBESAdminOnly: true,
};
