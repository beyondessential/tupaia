import React from 'react';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'User',
    source: 'user.email',
    editable: false,
  },
  {
    Header: 'Country',
    source: 'country.name',
    editConfig: { optionsEndpoint: 'countries' },
  },
  {
    Header: 'Message',
    source: 'message',
    editable: false,
    editConfig: { type: 'textarea' },
  },
  {
    Header: 'Permission Group',
    source: 'permission_group',
    editConfig: { optionsEndpoint: 'permissionGroups', optionValueKey: 'name' },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Approve',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'accessRequests',
      fields: [
        ...FIELDS,
        {
          Header: 'Approved',
          source: 'approved',
          accessor: () => true,
          editable: false,
          hidden: true,
        },
      ],
      icon: 'check',
      allowNoChangeSave: true,
    },
  },
];

export const AccessRequestsPage = () => (
  <ResourcePage
    title="Access Requests"
    endpoint="accessRequests"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit & Approve Access Request',
      confirmLabel: 'Approve',
    }}
  />
);
