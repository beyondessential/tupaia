import { syncGroups } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes';
import { getCreateConfigs, getDeleteColumnConfigs, getBaseEditorConfigs } from '../helpers';

const SERVICE_TYPES = [{ label: 'Kobo', value: 'kobo' }];

export const getSyncGroupsPageConfig = translate => {
  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.surveyCode'),
      source: 'data_group_code',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.serviceType'),
      source: 'service_type',
      Filter: getColumnFilter(translate),
      editConfig: {
        options: SERVICE_TYPES,
      },
    },
    {
      Header: translate('admin.config'),
      source: 'config',
      Filter: getColumnFilter(translate),
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
      disableSortBy: true,
      width: 200,
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

  return {
    ...syncGroups,
    label: translate('admin.syncGroups'),
    columns: COLUMNS,
    editorConfig,
    createConfig,
  };
};
