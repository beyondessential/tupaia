import React from 'react';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'TMP',
    source: 'tmp',
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
      editEndpoint: 'dashboardGroups',
      fields: [...FIELDS],
    },
  },
];

export const DashboardGroupsPage = () => (
  <ResourcePage
    title="Dashboard Groups"
    endpoint="dashboardGroups"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit Dashboard Group',
    }}
  />
);
