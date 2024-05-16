/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const DASHBOARD_MAILING_LIST_FIELDS = {
  project: {
    Header: 'Project',
    source: 'project.code',
    required: true,
    editConfig: {
      sourceKey: 'project_id',
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'id',
      allowMultipleValues: false,
      secondaryLabel: 'Select the project this dashboard mailing list should be available in',
    },
  },
  dashboard_code: {
    Header: 'Dashboard code',
    source: 'dashboard.code',
    required: true,
    editConfig: {
      sourceKey: 'dashboard_id',
      optionsEndpoint: 'dashboards',
      optionLabelKey: 'code',
      optionValueKey: 'id',
      secondaryLabel: 'Select the dashboard this mailing list should be for',
    },
  },
  dashboard_name: {
    Header: 'Dashboard name',
    source: 'dashboard.name',
  },
  entity_code: {
    Header: 'Entity code',
    source: 'entity.code',
  },
  entity_name: {
    Header: 'Entity name',
    source: 'entity.name',
    required: true,
    editConfig: {
      sourceKey: 'entity_id',
      optionsEndpoint: 'entities',
      optionLabelKey: 'name',
      optionValueKey: 'id',
      secondaryLabel: 'Select the entity this dashboard mailing list should be for',
    },
  },
  admin_permission_groups: {
    Header: 'Admin permission groups',
    source: 'admin_permission_groups',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'admin_permission_groups',
      allowMultipleValues: true,
      secondaryLabel:
        'Users with any of these permissions can send out the dashboard to the mailing list',
    },
  },
};

const DASHBOARD_MAILING_LIST_COLUMNS = [
  ...Object.values(DASHBOARD_MAILING_LIST_FIELDS),
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Dashboard Mailing List',
      editEndpoint: 'dashboardMailingLists',
      fields: [
        DASHBOARD_MAILING_LIST_FIELDS.project,
        DASHBOARD_MAILING_LIST_FIELDS.dashboard_code,
        DASHBOARD_MAILING_LIST_FIELDS.entity_name,
        DASHBOARD_MAILING_LIST_FIELDS.admin_permission_groups,
      ],
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: 'dashboardMailingLists',
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'dashboardMailingLists',
    fields: [
      DASHBOARD_MAILING_LIST_FIELDS.project,
      DASHBOARD_MAILING_LIST_FIELDS.dashboard_code,
      DASHBOARD_MAILING_LIST_FIELDS.entity_name,
      DASHBOARD_MAILING_LIST_FIELDS.admin_permission_groups,
    ],
    title: 'New dashboard mailing list',
  },
};

const ENTRY_FIELDS = [
  {
    Header: 'Email',
    source: 'dashboard_mailing_list_entry.email',
    required: true,
    type: 'tooltip',
  },
  {
    Header: 'Subscribed',
    source: 'dashboard_mailing_list_entry.subscribed',
    type: 'boolean',
    required: true,
    editConfig: { type: 'boolean' },
  },
];

const ENTRY_COLUMNS = [
  ...ENTRY_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Entry',
      editEndpoint: 'dashboardMailingListEntries',
      fields: [...ENTRY_FIELDS],
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: 'dashboardMailingListEntries',
    },
  },
];

export const dashboardMailingLists = {
  title: 'Dashboard mailing lists',
  path: '/dashboard-mailing-lists',
  endpoint: 'dashboardMailingLists',
  columns: DASHBOARD_MAILING_LIST_COLUMNS,
  createConfig: CREATE_CONFIG,
  nestedView: {
    title: 'Entries',
    endpoint: 'dashboardMailingLists/{id}/dashboardMailingListEntries',
    columns: ENTRY_COLUMNS,
    path: '/:id/entries',
    displayProperty: 'dashboard.name',
  },
  isBESAdminOnly: true,
};
