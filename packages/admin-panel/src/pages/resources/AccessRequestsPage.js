import React from 'react';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'User',
    source: 'user.email',
    editable: false,
  },
  {
    Header: 'Entity',
    source: 'entity.name',
    editConfig: { optionsEndpoint: 'entities' },
  },
  {
    Header: 'Message',
    source: 'message',
    editable: false,
    editConfig: { type: 'textarea' },
  },
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
    editConfig: { optionsEndpoint: 'permissionGroups' },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Approve/Decline',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'accessRequests',
      fields: [
        ...FIELDS,
        {
          Header: 'Approved',
          source: 'approved',
          type: 'boolean',
          editConfig: {
            type: 'boolean',
          },
        },
        {
          Header: 'Approval Note',
          source: 'approval_note',
          editConfig: { type: 'textarea' },
        },
      ],
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
    }}
    baseFilter={{ approved: null }}
  />
);
