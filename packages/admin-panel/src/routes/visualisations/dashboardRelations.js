/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

// export for use on users page
export const DASHBOARD_RELATION_ENDPOINT = 'dashboardRelations';
export const DASHBOARD_RELATION_COLUMNS = [
  {
    Header: 'Dashboard Code',
    source: 'dashboard.code',
    editConfig: {
      optionsEndpoint: 'dashboards',
      optionLabelKey: 'dashboard.code',
      optionValueKey: 'dashboard.id',
      sourceKey: 'dashboard_id',
    },
  },
  {
    Header: 'Dashboard Item Code',
    source: 'dashboard_item.code',
    editConfig: {
      optionsEndpoint: 'dashboardItems',
      optionLabelKey: 'dashboard_item.code',
      optionValueKey: 'dashboard_item.id',
      sourceKey: 'child_id',
    },
  },
  {
    Header: 'Permission Groups',
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
    Header: 'Entity Types',
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
    Header: 'Attributes Filter',
    source: 'attributes_filter',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Project Codes',
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
    Header: 'Sort Order',
    source: 'sort_order',
  },
];

const COLUMNS = [
  ...DASHBOARD_RELATION_COLUMNS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Dashboard Relation',
      editEndpoint: DASHBOARD_RELATION_ENDPOINT,
      fields: DASHBOARD_RELATION_COLUMNS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: DASHBOARD_RELATION_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  title: 'Create a new relation between Dashboard and DashboardItem',
  actionConfig: {
    editEndpoint: DASHBOARD_RELATION_ENDPOINT,
    fields: DASHBOARD_RELATION_COLUMNS,
  },
};

export const dashboardRelations = {
  title: 'Dashboard relations',
  path: '/dashboard-relations',
  endpoint: DASHBOARD_RELATION_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
