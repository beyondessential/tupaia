/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DASHBOARD_RELATION_COLUMNS } from './dashboardRelations';

const DASHBOARDS_ENDPOINT = 'dashboards';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
    required: true,
  },
  {
    Header: 'Name',
    source: 'name',
    required: true,
  },
  {
    Header: 'Organisation Unit Code',
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
    Header: 'Sort Order',
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
      title: 'Edit Dashboard',
      editEndpoint: 'dashboards',
      fields: [...FIELDS],
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
    Header: 'Dashboard Item Code',
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
  title: 'Create a new Dashboard',
  actionConfig: {
    editEndpoint: DASHBOARDS_ENDPOINT,
    fields: FIELDS,
  },
};

export const dashboards = {
  title: 'Dashboards',
  path: '/dashboards',
  endpoint: DASHBOARDS_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  nestedViews: [
    {
      title: 'Dashboard Relations',
      columns: RELATION_COLUMNS,
      endpoint: 'dashboards/{id}/dashboardRelations',
      path: '/:id/dashboard-relations',
      displayProperty: 'name',
    },
  ],
  needsBESAdminAccess: ['delete'],
};
