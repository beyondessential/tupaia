/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Readonly',
    source: 'readonly',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
    },
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
  title: 'New Dhis Instance',
  actionConfig: {
    editEndpoint: 'dhisInstances',
    fields: FIELDS,
  },
};

export const dhisInstances = {
  title: 'DHIS Instances',
  endpoint: 'dhisInstances',
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  url: '/dhis-instances',
};
