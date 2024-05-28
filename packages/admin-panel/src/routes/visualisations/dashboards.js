/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import {
  RESOURCE_NAME as DASHBOARD_RELATION_RESOURCE_NAME,
  DASHBOARD_RELATION_COLUMNS,
} from './dashboardRelations';

const RESOURCE_NAME = { singular: 'dashboard' };

const DASHBOARDS_ENDPOINT = 'dashboards';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Name',
    source: 'name',
    required: true,
  },
  {
    Header: 'Organisation unit code',
    source: 'root_entity_code',
    required: true,
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
  DASHBOARD_RELATION_COLUMNS.PERMISSION_GROUPS,
  DASHBOARD_RELATION_COLUMNS.ENTITY_TYPES,
  DASHBOARD_RELATION_COLUMNS.PROJECT_CODES,
  DASHBOARD_RELATION_COLUMNS.SORT_ORDER,
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
      resourceName: DASHBOARD_RELATION_RESOURCE_NAME,
      columns: RELATION_COLUMNS,
      endpoint: 'dashboards/{id}/dashboardRelations',
      path: '/:id/dashboard-relations',
      displayProperty: 'name',
    },
  ],
  needsBESAdminAccess: ['delete'],
};
