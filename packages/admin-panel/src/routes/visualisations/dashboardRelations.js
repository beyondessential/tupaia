import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

export const RESOURCE_NAME = { singular: 'dashboard relation' };

export const DASHBOARD_RELATION_ENDPOINT = 'dashboardRelations';

export const FIELDS = {
  DASHBOARD_CODE: {
    Header: 'Dashboard code',
    source: 'dashboard.code',
    required: true,
    editConfig: {
      optionsEndpoint: 'dashboards',
      optionLabelKey: 'dashboard.code',
      optionValueKey: 'dashboard.id',
      sourceKey: 'dashboard_id',
      accessor: record => record['dashboard.code'],
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
      accessor: record => record['dashboard_item.code'],
    },
  },
  PERMISSION_GROUPS: {
    Header: 'Permission groups',
    source: 'permission_groups',
    Filter: ArrayFilter,
    required: true,
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
    required: true,
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
    required: true,
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

const DASHBOARD_RELATION_FIELDS = [
  FIELDS.DASHBOARD_CODE,
  FIELDS.DASHBOARD_ITEM_CODE,
  FIELDS.PERMISSION_GROUPS,
  FIELDS.ENTITY_TYPES,
  FIELDS.ATTRIBUTES_FILTER,
  FIELDS.PROJECT_CODES,
  FIELDS.SORT_ORDER,
];

const COLUMNS = [
  ...DASHBOARD_RELATION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: DASHBOARD_RELATION_ENDPOINT,
      fields: DASHBOARD_RELATION_FIELDS,
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
    fields: [
      FIELDS.DASHBOARD_CODE,
      FIELDS.DASHBOARD_ITEM_CODE,
      FIELDS.PERMISSION_GROUPS,
      FIELDS.ENTITY_TYPES,
      FIELDS.PROJECT_CODES,
      FIELDS.SORT_ORDER,
    ],
  },
};

export const dashboardRelations = {
  resourceName: RESOURCE_NAME,
  path: '/dashboard-relations',
  endpoint: DASHBOARD_RELATION_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  needsVizBuilderAccess: ['create'],
};
