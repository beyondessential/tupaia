/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Data Builder',
    source: 'data_builder',
    type: 'tooltip',
  },
  {
    Header: 'Data Builder Config',
    source: 'data_builder_config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Data Services',
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
      title: 'Edit Legacy Report',
      editEndpoint: 'legacyReports',
      fields: [...FIELDS],
    },
  },
];

export const legacyReports = {
  title: 'Legacy reports',
  url: '/legacy-reports',
  endpoint: 'legacyReports',
  columns: COLUMNS,
};
