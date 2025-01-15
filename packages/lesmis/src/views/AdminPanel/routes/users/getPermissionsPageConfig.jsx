import { permissions } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes';
import {
  getBaseEditorConfigs,
  getCreateConfigs,
  getDeleteColumnConfigs,
  getDeleteConfigs,
} from '../helpers';

export const getPermissionsPageConfig = translate => {
  const PERMISSIONS_COLUMNS = [
    {
      Header: translate('admin.entity'),
      source: 'entity.name',
      editConfig: {
        optionsEndpoint: 'entities',
        baseFilter: { type: 'country' },
      },
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.permissionGroup'),
      source: 'permission_group.name',
      editConfig: {
        optionsEndpoint: 'permissionGroups',
      },
      Filter: getColumnFilter(translate),
    },
  ];

  const FIELDS = [
    {
      Header: translate('admin.user'),
      source: 'user.first_name',
      accessor: rowData => `${rowData['user.first_name']} ${rowData['user.last_name']}`,
      editable: false,
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.emailAddress'),
      source: 'user.email',
      editable: false,
      Filter: getColumnFilter(translate),
    },
    {
      source: 'user.last_name',
      show: false,
    },
    ...PERMISSIONS_COLUMNS,
    {
      Header: translate('admin.edit'),
      source: 'id',
      type: 'edit',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: permissions.endpoint,
        fields: PERMISSIONS_COLUMNS,
      },
    },
    getDeleteColumnConfigs(permissions.endpoint, translate),
  ];

  const editorConfig = getBaseEditorConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    bulkCreate: true,
    actionConfig: {
      bulkUpdateEndpoint: permissions.endpoint,
      fields: [
        {
          Header: translate('admin.emailAddress'),
          source: 'user.email',
          editConfig: {
            optionsEndpoint: 'users',
            optionLabelKey: 'email',
            allowMultipleValues: true,
          },
        },
        {
          Header: translate('admin.entity'),
          source: 'entity.name',
          editConfig: {
            optionsEndpoint: 'entities',
            baseFilter: { type: 'country' },
            allowMultipleValues: true,
          },
        },
        {
          Header: translate('admin.permissionGroup'),
          source: 'permission_group.name',
          editConfig: {
            optionsEndpoint: 'permissionGroups',
            allowMultipleValues: true,
          },
        },
      ],
    },
  });
  const deleteConfig = getDeleteConfigs(translate);
  return {
    ...permissions,
    label: translate('admin.permissions'),
    columns: FIELDS,
    editorConfig,
    createConfig,
    deleteConfig,
  };
};
