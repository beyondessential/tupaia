import React from 'react';
import { ResourcePage } from './ResourcePage';
import { prettyJSON } from '../../utilities/pretty';

const FIELDS = [
  {
    Header: 'Drill Down Level',
    source: 'drillDownLevel',
    width: 150,
  },
  {
    Header: 'Data Builder',
    source: 'dataBuilder',
  },
  {
    Header: 'Data Builder Config',
    source: 'dataBuilderConfig',
    width: 350,
    Cell: ({ original: { dataBuilderConfig } }) => prettyJSON(dataBuilderConfig),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'View JSON',
    source: 'viewJson',
    width: 350,
    Cell: ({ original: { viewJson } }) => prettyJSON(viewJson),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Data Services',
    source: 'dataServices',
    width: 250,
    Cell: ({ original: { dataServices } }) => prettyJSON(dataServices),
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

export const DashboardReportsPage = () => (
  <ResourcePage
    title="Dashboard Reports"
    endpoint="dashboardReports"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit Dashboard Report',
    }}
  />
);
