/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

const SERVICE_TYPES = [{ label: 'Kobo', value: 'kobo' }];

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Survey Code',
    source: 'data_group_code',
  },
  {
    Header: 'Service Type',
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
      fields: [...FIELDS],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'dataServiceSyncGroups',
    },
  },
  {
    Header: 'Logs',
    type: 'logs',
    source: 'id',
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
    sortable: false,
    width: 180,
    actionConfig: {
      syncStatusEndpoint: 'dataServiceSyncGroups/{id}',
      latestSyncLogEndpoint: 'dataServiceSyncGroups/{id}/logs?limit=1',
      manualSyncEndpoint: 'dataServiceSyncGroups/{id}/sync',
    },
  },
];

const EDITOR_CONFIG = {
  title: 'Edit Sync Group',
};

const CREATE_CONFIG = {
  title: 'Add Sync Group',
  actionConfig: {
    editEndpoint: 'dataServiceSyncGroups',
    fields: FIELDS,
  },
};

export const SyncGroupsPage = props => (
  <ResourcePage
    title="Sync Groups"
    endpoint="dataServiceSyncGroups"
    columns={COLUMNS}
    editorConfig={EDITOR_CONFIG}
    createConfig={CREATE_CONFIG}
    {...props}
  />
);
