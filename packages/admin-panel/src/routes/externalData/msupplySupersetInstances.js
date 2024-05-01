/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
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
  title: 'New Superset Instance',
  actionConfig: {
    editEndpoint: 'supersetInstances',
    fields: FIELDS,
  },
};

export const supersetInstances = {
  title: 'mSupply superset Instances',
  endpoint: 'supersetInstances',
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  url: '/superset-instances',
};
