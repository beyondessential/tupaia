/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

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
  path: '/dhis-instances',
};
