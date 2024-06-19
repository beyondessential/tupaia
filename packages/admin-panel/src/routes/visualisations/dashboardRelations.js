/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

export const RESOURCE_NAME = { singular: 'dashboard relation' };

// export for use on users page
export const DASHBOARD_RELATION_ENDPOINT = 'dashboardRelations';
export const DASHBOARD_RELATION_COLUMNS = [
  {
    Header: 'Dashboard code',
    source: 'dashboard.code',
    editConfig: {
      optionsEndpoint: 'dashboards',
      optionLabelKey: 'dashboard.code',
      optionValueKey: 'dashboard.id',
      sourceKey: 'dashboard_id',
    },
  },
  {
    Header: 'Dashboard item code',
    source: 'dashboard_item.code',
    editConfig: {
      optionsEndpoint: 'dashboardItems',
      optionLabelKey: 'dashboard_item.code',
      optionValueKey: 'dashboard_item.id',
      sourceKey: 'child_id',
    },
  },
  {
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
  {
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
      secondaryLabel: 'Input the entity types you want. e.g: ‘country’, ‘sub_district’',
    },
  },
  {
    Header: 'Attributes filter',
    source: 'attributes_filter',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
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
  {
    Header: 'Sort order',
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
      title: `Edit ${RESOURCE_NAME.singular}`,
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
  actionConfig: {
    title: 'Add relation between dashboard and dashboard item',
    editEndpoint: DASHBOARD_RELATION_ENDPOINT,
    fields: DASHBOARD_RELATION_COLUMNS,
  },
};

export const dashboardRelations = {
  resourceName: RESOURCE_NAME,
  path: '/dashboard-relations',
  endpoint: DASHBOARD_RELATION_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
