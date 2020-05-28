import React from 'react';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'User',
    source: 'user.email',
  },
  {
    Header: 'Country',
    source: 'country.name',
  },
  {
    Header: 'Message',
    source: 'message',
  },
  {
    Header: 'Permission Group',
    source: 'permission_group',
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'accessRequests',
      fields: [...FIELDS],
    },
  },
];

export const AccessRequestsPage = () => (
  <ResourcePage
    title="Access Requests"
    endpoint="accessRequests"
    columns={COLUMNS}
    editConfig={{
      title: 'Approve/Edit Access Request',
    }}
  />
);
