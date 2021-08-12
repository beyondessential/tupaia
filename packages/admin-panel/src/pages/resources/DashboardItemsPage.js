/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Report Code',
    source: 'report_code',
    type: 'tooltip',
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Legacy',
    source: 'legacy',
    type: 'boolean',
    editConfig: { type: 'boolean' },
  },
];

const EXTRA_EDIT_FIELDS = [
  // ID field for constructing viz-builder path only, not for showing or editing
  {
    Header: 'ID',
    source: 'id',
    show: false,
  },
  {
    Header: 'Edit in Visualisation Builder',
    type: 'link',
    editConfig: {
      type: 'link',
      linkOptions: {
        path: '/viz-builder/:id',
        parameters: { id: 'id' },
      },
      visibilityCriteria: {
        legacy: false,
      },
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dashboardItems',
      fields: [...FIELDS, ...EXTRA_EDIT_FIELDS],
    },
  },
];

export const DashboardItemsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Dashboard Items"
    endpoint="dashboardItems"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit Dashboard Item',
    }}
    getHeaderEl={getHeaderEl}
  />
);

DashboardItemsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
