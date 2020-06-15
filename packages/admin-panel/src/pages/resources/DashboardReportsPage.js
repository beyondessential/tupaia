import React from 'react';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'Drill Down Level',
    source: '"dashboardReport"."drillDownLevel"',
    editable: false,
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
