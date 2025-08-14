import { dashboards } from '@tupaia/admin-panel';
import {
  getBaseEditorConfigs,
  getCreateConfigs,
  getDeleteColumnConfigs,
  getDeleteConfigs,
} from '../helpers';
import { getColumnFilter } from '../../table/columnTypes';

export const getDashboardsPageConfig = translate => {
  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',

      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.name'),
      source: 'name',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.organisationUnitCode'),
      source: 'root_entity_code',
      Filter: getColumnFilter(translate),

      editConfig: {
        optionsEndpoint: 'entities',
        optionLabelKey: 'code',
        optionValueKey: 'code',
        sourceKey: 'root_entity_code',
      },
    },
    {
      Header: translate('admin.sortOrder'),
      Filter: getColumnFilter(translate),
      source: 'sort_order',
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
        editEndpoint: 'dashboards',
        fields: FIELDS,
      },
    },
    getDeleteColumnConfigs(dashboards.endpoint, translate),
  ];

  const RELATION_FIELDS = [
    {
      Header: translate('admin.dashboardItemCode'),
      source: 'dashboard_item.code',
      editable: false,
    },
    {
      Header: translate('admin.permissionGroups'),
      source: 'permission_groups',
      editConfig: {
        optionsEndpoint: 'permissionGroups',
        optionLabelKey: 'name',
        optionValueKey: 'name',
        sourceKey: 'permission_groups',
        allowMultipleValues: true,
      },
    },
    {
      Header: translate('admin.entityTypes'),
      source: 'entity_types',
      editConfig: {
        type: 'autocomplete',
        allowMultipleValues: true,
        canCreateNewOptions: true,
        optionLabelKey: 'entityTypes',
        optionValueKey: 'entityTypes',
        secondaryLabel: "Input the entity types you want. Eg: 'country', 'sub_district'",
      },
    },
    {
      Header: translate('admin.projectCodes'),
      source: 'project_codes',
      editConfig: {
        optionsEndpoint: 'projects',
        optionLabelKey: 'code',
        optionValueKey: 'code',
        sourceKey: 'project_codes',
        allowMultipleValues: true,
      },
    },
    {
      Header: translate('admin.sortOrder'),
      source: 'sort_order',
    },
  ];

  const RELATION_COLUMNS = [
    ...RELATION_FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        editEndpoint: 'dashboardRelations',
        fields: RELATION_FIELDS,
      },
    },
  ];

  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: dashboards.endpoint,
      fields: FIELDS,
    },
  });
  const editorConfig = getBaseEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);

  return {
    ...dashboards,
    label: translate('admin.dashboards'),
    columns: COLUMNS,
    createConfig,
    editorConfig,
    deleteConfig,
    needsBESAdminAccess: [],
    nestedViews: [
      {
        ...dashboards.nestedViews[0],
        label: translate('admin.dashboardRelations'),
        columns: RELATION_COLUMNS,
      },
    ],
  };
};
