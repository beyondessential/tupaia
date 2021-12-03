/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

export const ACCESS_REQUESTS_ENDPOINT = 'accessRequests';

const USER_FIELDS = [
  {
    Header: 'Email Address',
    source: 'user_account.email',
    type: 'tooltip',
  },
  {
    Header: 'First Name',
    source: 'user.first_name',
  },
  {
    Header: 'Last Name',
    source: 'user.last_name',
  },
  {
    Header: 'Employer',
    source: 'user.employer',
  },
  {
    Header: 'Phone',
    source: 'user.mobile_number',
  },
  {
    Header: 'Approved',
    source: 'approved',
    show: false,
  },
  {
    Header: 'user_id',
    source: 'user_id',
    show: false,
  },
];

const ACCESS_REQUEST_FIELDS = [
  {
    Header: 'Entity',
    source: 'entity.name',
    editConfig: { optionsEndpoint: 'entities', baseFilter: { type: 'country' } },
  },
  {
    Header: 'Project Code',
    source: 'project.code',
    editable: false,
  },
  {
    Header: 'Message',
    source: 'message',
    type: 'tooltip',
    editable: false,
  },
  {
    Header: 'Note',
    source: 'note',
    editConfig: { type: 'textarea' },
  },
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      secondaryLabel:
        'If a default is shown here, it will give the user access to the project they requested, but please review carefully as some projects have several permission levels.',
    },
  },
];

const USER_COLUMNS = [
  ...USER_FIELDS,
  {
    Header: 'Edit',
    source: 'user_id',
    type: 'bulkEdit',
    width: 150,
    actionConfig: {
      editEndpoint: `users/{user_id}/${ACCESS_REQUESTS_ENDPOINT}`,
      baseFilter: { approved: null },
      fields: [
        {
          Header: 'Entity',
          source: 'entity.name',
          bulkAccessor: rows => {
            return rows.map(row => row['entity.name']).join(', ');
          },
          editable: false,
        },
        {
          Header: 'Project Code',
          source: 'project.code',
          editable: false,
        },
        {
          Header: 'Message',
          source: 'message',
          type: 'tooltip',
          editable: false,
        },
        {
          Header: 'id',
          source: 'id',
          show: false,
        },
        {
          Header: 'Permission Group',
          source: 'permission_group.name',
          editConfig: {
            optionsEndpoint: 'permissionGroups',
            secondaryLabel:
              'If a default is shown here, it will give the user access to the project they requested, but please review carefully as some projects have several permission levels.',
          },
        },
        {
          Header: 'Approved',
          source: 'approved',
          type: 'boolean',
          editConfig: {
            type: 'boolean',
          },
        },
        {
          Header: 'Note',
          source: 'note',
          editConfig: { type: 'textarea' },
        },
      ],
    },
  },
];

const EXPANSION_COLUMNS = [
  ...ACCESS_REQUEST_FIELDS,
  {
    Header: 'Approve/Decline',
    width: 140,
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'accessRequests',
      fields: [
        ...ACCESS_REQUEST_FIELDS,
        {
          Header: 'Approved',
          source: 'approved',
          type: 'boolean',
          editConfig: {
            type: 'boolean',
          },
        },
      ],
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Access Requests',
    endpoint: `users/{user_id}/${ACCESS_REQUESTS_ENDPOINT}`,
    columns: EXPANSION_COLUMNS,
    baseFilter: { approved: null },
  },
];

export const AccessRequestsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Access Requests"
    endpoint="accessRequests"
    columns={USER_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    baseFilter={{ approved: null }}
    editConfig={{
      title: 'Edit & Approve Access Request',
    }}
    getHeaderEl={getHeaderEl}
    onProcessDataForSave={(editedFields, recordData) => {
      const data = recordData.map(record => {
        return { ...record, ...editedFields };
      });
      return data;
    }}
  />
);

AccessRequestsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
