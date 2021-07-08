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

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dashboardItems',
      fields: [...FIELDS],
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
