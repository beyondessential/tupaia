/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'sync group' };

const SERVICE_TYPES = [{ label: 'Kobo', value: 'kobo' }];

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Survey code',
    source: 'data_group_code',
  },
  {
    Header: 'Service type',
    source: 'service_type',
    editConfig: {
      options: SERVICE_TYPES,
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
      editEndpoint: 'dataServiceSyncGroups',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: 'dataServiceSyncGroups',
    },
  },
  {
    Header: 'Logs',
    type: 'logs',
    actionConfig: {
      title: '{code} sync group logs',
      logsCountEndpoint: 'dataServiceSyncGroups/{id}/logs/count',
      logsEndpoint: 'dataServiceSyncGroups/{id}/logs',
      logsPerPage: 100,
    },
  },
  {
    Header: 'Sync',
    type: 'sync',
    source: 'sync_status',
    filterable: false,
    disableSortBy: true,
    width: 200,
    actionConfig: {
      syncStatusEndpoint: 'dataServiceSyncGroups/{id}',
      latestSyncLogEndpoint: 'dataServiceSyncGroups/{id}/logs?limit=1',
      manualSyncEndpoint: 'dataServiceSyncGroups/{id}/sync',
    },
  },
];

const EDITOR_CONFIG = {
  title: `Edit ${RESOURCE_NAME.singular}`,
};

const CREATE_CONFIG = {
  actionConfig: {
    title: `New ${RESOURCE_NAME.singular}`,
    editEndpoint: 'dataServiceSyncGroups',
    fields: FIELDS,
  },
};

export const syncGroups = {
  resourceName: RESOURCE_NAME,
  path: '/sync-groups',
  endpoint: 'dataServiceSyncGroups',
  columns: COLUMNS,
  editorConfig: EDITOR_CONFIG,
  createConfig: CREATE_CONFIG,
  isBESAdminOnly: true,
};
