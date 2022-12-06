/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SyncGroupsPage as BaseSyncGroupsPage } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes/getColumnFilter';
import { getCreateConfigs, getBaseEditorConfigs } from '../helpers';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';

const SERVICE_TYPES = [{ label: 'Kobo', value: 'kobo' }];

export const SyncGroupsPage = ({ getHeaderEl, translate }) => {
  const ColumnFilter = getColumnFilter(translate);

  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      Fitler: ColumnFilter,
    },
    {
      Header: translate('admin.surveyCode'),
      source: 'data_group_code',
      Fitler: ColumnFilter,
    },
    {
      Header: translate('admin.serviceType'),
      source: 'service_type',
      Fitler: ColumnFilter,
      editConfig: {
        options: SERVICE_TYPES,
      },
    },
    {
      Header: translate('admin.config'),
      source: 'config',
      Fitler: ColumnFilter,
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
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'dataServiceSyncGroups',
        fields: [...FIELDS],
      },
    },
    getDeleteColumnConfigs('dataServiceSyncGroups', translate),
    {
      Header: translate('admin.logs'),
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
      Header: translate('admin.sync'),
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

  const editorConfig = getBaseEditorConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: 'dataServiceSyncGroups',
      fields: FIELDS,
    },
  });

  return (
    <BaseSyncGroupsPage
      title={translate('admin.syncGroups')}
      endpoint="dataServiceSyncGroups"
      columns={COLUMNS}
      editorConfig={editorConfig}
      createConfig={createConfig}
      getHeaderEl={getHeaderEl}
    />
  );
};

SyncGroupsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
