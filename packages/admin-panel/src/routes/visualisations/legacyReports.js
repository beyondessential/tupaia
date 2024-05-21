/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'legacy report' };

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Data builder',
    source: 'data_builder',
    type: 'tooltip',
  },
  {
    Header: 'Data builder config',
    source: 'data_builder_config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Data services',
    source: 'data_services',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'legacyReports',
      fields: FIELDS,
    },
  },
];

export const legacyReports = {
  resourceName: RESOURCE_NAME,
  path: '/legacy-reports',
  endpoint: 'legacyReports',
  columns: COLUMNS,
  isBESAdminOnly: true,
};
