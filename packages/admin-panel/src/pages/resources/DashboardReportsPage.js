/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'ID',
    source: 'id',
    type: 'tooltip',
  },
  {
    Header: 'Drill Down Level',
    source: 'drillDownLevel',
  },
  {
    Header: 'Data Builder',
    source: 'dataBuilder',
    type: 'tooltip',
  },
  {
    Header: 'Data Builder Config',
    source: 'dataBuilderConfig',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'View JSON',
    source: 'viewJson',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Data Services',
    source: 'dataServices',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dashboardReports',
      fields: [...FIELDS],
    },
  },
];

export const DashboardReportsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Dashboard Reports"
    endpoint="dashboardReports"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit Dashboard Report',
    }}
    getHeaderEl={getHeaderEl}
  />
);

DashboardReportsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
