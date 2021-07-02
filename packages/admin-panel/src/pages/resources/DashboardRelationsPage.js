/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

// export for use on users page
export const DASHBOARD_RELATION_ENDPOINT = 'dashboardRelations';
export const DASHBOARD_RELATION_COLUMNS = [
  {
    Header: 'Dashboard Code',
    source: 'dashboard.code',
    editConfig: {
      optionsEndpoint: 'dashboards',
    },
  },
  {
    Header: 'Dashboard Item Code',
    source: 'dashboard_item.code',
    editConfig: {
      optionsEndpoint: 'dashboardItems',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'code',
    },
  },
  {
    Header: 'Permission Groups',
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
    Header: 'Entity Types',
    source: 'entity_types',
  },
  {
    Header: 'Project Codes',
    source: 'project_codes',
    editConfig: {
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'projectCodes',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Sort Order',
    source: 'sort_order',
  },
];

const FIELDS = [
  ...DASHBOARD_RELATION_COLUMNS,
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      editEndpoint: DASHBOARD_RELATION_ENDPOINT,
      fields: DASHBOARD_RELATION_COLUMNS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: DASHBOARD_RELATION_ENDPOINT,
    },
  },
];

const EDIT_CONFIG = {
  title: 'Edit Dashboard Relation',
};

const CREATE_CONFIG = {
  title: 'Create a new relation between Dashboard and DashboardItem',
  actionConfig: {
    editEndpoint: DASHBOARD_RELATION_ENDPOINT,
    fields: DASHBOARD_RELATION_COLUMNS,
  },
};

export const DashboardRelationsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Dashboard Relations"
    endpoint={DASHBOARD_RELATION_ENDPOINT}
    columns={FIELDS}
    editConfig={EDIT_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

DashboardRelationsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
