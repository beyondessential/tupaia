/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

// export for use on users page
export const DASHBOARD_RELATION_ENDPOINT = 'dashboardRelations';

export const DASHBOARD_RELATION_COLUMNS = {
  DASHBOARD_CODE: {
    Header: 'Dashboard code',
    source: 'dashboard.code',
    required: true,
    editConfig: {
      optionsEndpoint: 'dashboards',
      optionLabelKey: 'dashboard.code',
      optionValueKey: 'dashboard.id',
      sourceKey: 'dashboard_id',
    },
  },
  DASHBOARD_ITEM_CODE: {
    Header: 'Dashboard item code',
    source: 'dashboard_item.code',
    required: true,
    editConfig: {
      optionsEndpoint: 'dashboardItems',
      optionLabelKey: 'dashboard_item.code',
      optionValueKey: 'dashboard_item.id',
      sourceKey: 'child_id',
    },
  },
  PERMISSION_GROUPS: {
    Header: 'Permission groups',
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
  ENTITY_TYPES: {
    Header: 'Entity types',
    source: 'entity_types',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      type: 'autocomplete',
      allowMultipleValues: true,
      canCreateNewOptions: true,
      optionLabelKey: 'entityTypes',
      optionValueKey: 'entityTypes',
      labelTooltip: "Input the entity types you want. Eg: 'country', 'sub_district'",
    },
  },
  ATTRIBUTES_FILTER: {
    Header: 'Attributes filter',
    source: 'attributes_filter',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  PROJECT_CODES: {
    Header: 'Project codes',
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
  SORT_ORDER: {
    Header: 'Sort order',
    source: 'sort_order',
  },
};

const FIELDS = Object.values(DASHBOARD_RELATION_COLUMNS);

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Dashboard Relation',
      editEndpoint: DASHBOARD_RELATION_ENDPOINT,
      fields: FIELDS,
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
    fields: FIELDS,
  },
};

export const dashboardRelations = {
  title: 'Dashboard relations',
  path: '/dashboard-relations',
  endpoint: DASHBOARD_RELATION_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
