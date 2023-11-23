/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const DASHBOARD_MAILING_LIST_FIELDS = {
  project: {
    Header: 'Project',
    source: 'project.code',
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
    editConfig: {
      sourceKey: 'entity_id',
      optionsEndpoint: 'entities',
      optionLabelKey: 'name',
      optionValueKey: 'id',
      secondaryLabel: 'Select the entity this dashboard mailing list should be for',
    },
  },
  email_admin_permission_groups: {
    Header: 'Email admin permission groups',
    source: 'email_admin_permission_groups',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'email_admin_permission_groups',
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
        DASHBOARD_MAILING_LIST_FIELDS.email_admin_permission_groups,
      ],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
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
      DASHBOARD_MAILING_LIST_FIELDS.email_admin_permission_groups,
    ],
    title: 'New dashboard mailing list',
  },
};

const ENTRY_FIELDS = [
  {
    Header: 'Email',
    source: 'dashboard_mailing_list_entry.email',
    type: 'tooltip',
  },
  {
    Header: 'Subscribed',
    source: 'dashboard_mailing_list_entry.subscribed',
    type: 'boolean',
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
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'dashboardMailingListEntries',
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Entries',
    endpoint: 'dashboardMailingLists/{id}/dashboardMailingListEntries',
    columns: ENTRY_COLUMNS,
  },
];

export const DashboardMailingListsPage = ({ getHeaderEl, ...restOfProps }) => (
  <ResourcePage
    title="Dashboard Mailing Lists"
    endpoint="dashboardMailingLists"
    columns={DASHBOARD_MAILING_LIST_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...restOfProps}
  />
);

DashboardMailingListsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
