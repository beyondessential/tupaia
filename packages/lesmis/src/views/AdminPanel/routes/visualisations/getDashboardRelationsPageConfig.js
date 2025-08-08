import { dashboardRelations } from '@tupaia/admin-panel';
import { prettyArray } from '../../utilities';
import { getArrayFilter, getColumnFilter } from '../../table/columnTypes';
import {
  getBaseEditorConfigs,
  getCreateConfigs,
  getDeleteColumnConfigs,
  getDeleteConfigs,
} from '../helpers';

export const getDashboardRelationsPageConfig = translate => {
  const ArrayFilter = getArrayFilter(translate);

  const DASHBOARD_RELATION_COLUMNS = [
    {
      Header: translate('admin.code'),
      source: 'dashboard.code',
      Filter: getColumnFilter(translate),
      editConfig: {
        optionsEndpoint: 'dashboards',
        optionLabelKey: 'dashboard.code',
        optionValueKey: 'dashboard.id',
        sourceKey: 'dashboard_id',
      },
    },
    {
      Header: translate('admin.dashboardItemCode'),
      source: 'dashboard_item.code',
      Filter: getColumnFilter(translate),
      editConfig: {
        optionsEndpoint: 'dashboardItems',
        optionLabelKey: 'dashboard_item.code',
        optionValueKey: 'dashboard_item.id',
        sourceKey: 'child_id',
      },
    },
    {
      Header: translate('admin.permissionGroups'),
      source: 'permission_groups',
      Filter: ArrayFilter,
      Cell: ({ value }) => prettyArray(value),
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
      Filter: ArrayFilter,
      Cell: ({ value }) => prettyArray(value),
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
      Filter: ArrayFilter,
      Cell: ({ value }) => prettyArray(value),
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
      Filter: getColumnFilter(translate),
    },
  ];

  const FIELDS = [
    ...DASHBOARD_RELATION_COLUMNS,
    {
      Header: translate('admin.edit'),
      source: 'id',
      type: 'edit',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: dashboardRelations.endpoint,
        fields: DASHBOARD_RELATION_COLUMNS,
      },
    },
    getDeleteColumnConfigs(dashboardRelations.endpoint, translate),
  ];

  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: dashboardRelations.endpoint,
      fields: DASHBOARD_RELATION_COLUMNS,
    },
  });
  const editorConfig = getBaseEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);

  return {
    ...dashboardRelations,
    label: translate('admin.dashboardRelations'),
    endpoint: dashboardRelations.endpoint,
    columns: FIELDS,
    createConfig,
    editorConfig,
    deleteConfig,
  };
};
