import { dataElements } from '@tupaia/admin-panel';
import {
  DataSourceConfigView,
  SERVICE_TYPE_OPTIONS,
  getDataElementFieldEditConfig,
} from '../../common';
import { getColumnFilter } from '../../table/columnTypes';
import {
  getCreateConfigs,
  getDeleteColumnConfigs,
  getDeleteConfigs,
  getEditorConfigs,
  getImportConfigs,
} from '../helpers';

const getButtonsConfig = (fields, recordType, translate) => [
  {
    Header: translate('admin.edit'),
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: translate('admin.edit'),
      editEndpoint: `${recordType}s`,
      fields,
      displayUsedBy: true,
      recordType,
    },
  },
  getDeleteColumnConfigs(`${recordType}s`, translate),
];

const getDataElementFields = translate => {
  const DATA_ELEMENT_FIELD_EDIT_CONFIG = getDataElementFieldEditConfig(translate);
  const columnFilter = getColumnFilter(translate);

  return [
    {
      Header: translate('admin.code'),
      source: 'code',
      Filter: columnFilter,
    },
    {
      Header: translate('admin.dataService'),
      source: 'service_type',
      Filter: columnFilter,
      editConfig: { default: 'dhis', options: SERVICE_TYPE_OPTIONS },
    },
    {
      Header: translate('admin.dataServiceConfiguration'),
      source: 'config',
      Filter: columnFilter,
      Cell: DataSourceConfigView,
      editConfig: DATA_ELEMENT_FIELD_EDIT_CONFIG,
    },
    {
      Header: translate('admin.permissionGroups'),
      source: 'permission_groups',
      Filter: columnFilter,
      editConfig: {
        type: 'jsonArray',
      },
    },
  ];
};

export const getDataElementsPageConfig = translate => {
  const DATA_ELEMENT_FIELDS = getDataElementFields(translate);
  const importConfig = getImportConfigs(translate, {
    actionConfig: {
      importEndpoint: 'dataElements',
    },
  });

  const editorConfig = getEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: 'dataElements',
      fields: DATA_ELEMENT_FIELDS,
    },
  });

  return {
    ...dataElements,
    label: translate('admin.dataElements'),
    columns: [
      ...DATA_ELEMENT_FIELDS,
      ...getButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement', translate),
    ],
    importConfig,
    editorConfig,
    deleteConfig,
    createConfig,
  };
};
