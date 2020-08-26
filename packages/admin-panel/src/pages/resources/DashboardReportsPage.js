/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { prettyJSON } from '../../utilities/pretty';

const FIELDS = [
  {
    Header: 'ID',
    source: 'id',
  },
  {
    Header: 'Drill Down Level',
    source: 'drillDownLevel',
    width: 150,
  },
  {
    Header: 'Data Builder',
    source: 'dataBuilder',
    type: 'tooltip',
  },
  {
    Header: 'Data Builder Config',
    source: 'dataBuilderConfig',
    width: 350,
    Cell: ({ value }) => prettyJSON(value),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'View JSON',
    source: 'viewJson',
    width: 350,
    Cell: ({ value }) => prettyJSON(value),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Data Services',
    source: 'dataServices',
    width: 250,
    Cell: ({ value }) => prettyJSON(value),
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
