/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'dashboard' };

const DASHBOARDS_ENDPOINT = 'dashboards';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Organisation unit code',
    source: 'root_entity_code',
    editConfig: {
      optionsEndpoint: 'entities',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'root_entity_code',
    },
  },
  {
    Header: 'Sort order',
    source: 'sort_order',
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
      editEndpoint: DASHBOARDS_ENDPOINT,
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: DASHBOARDS_ENDPOINT,
    },
  },
];

const RELATION_FIELDS = [
  {
    Header: 'Dashboard item code',
    source: 'dashboard_item.code',
    editable: false,
  },
  {
    Header: 'Permission groups',
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
    Header: 'Entity types',
    source: 'entity_types',
    editConfig: {
      type: 'autocomplete',
      allowMultipleValues: true,
      canCreateNewOptions: true,
      optionLabelKey: 'entityTypes',
      optionValueKey: 'entityTypes',
      secondaryLabel: 'Input the entity types you want. e.g. ‘country’, ‘sub_district’',
    },
  },
  {
    Header: 'Project codes',
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
    Header: 'Sort order',
    source: 'sort_order',
  },
];

const RELATION_COLUMNS = [
  ...RELATION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dashboardRelations',
      fields: RELATION_FIELDS,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    title: `New ${RESOURCE_NAME.singular}`,
    editEndpoint: DASHBOARDS_ENDPOINT,
    fields: FIELDS,
  },
};

export const dashboards = {
  resourceName: RESOURCE_NAME,
  path: '/dashboards',
  endpoint: DASHBOARDS_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  nestedViews: [
    {
      resourceName: RESOURCE_NAME,
      columns: RELATION_COLUMNS,
      endpoint: 'dashboards/{id}/dashboardRelations',
      path: '/:id/dashboard-relations',
      displayProperty: 'name',
    },
  ],
  needsBESAdminAccess: ['delete'],
};
