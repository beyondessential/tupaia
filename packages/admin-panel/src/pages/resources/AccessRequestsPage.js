/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
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
    editConfig: { optionsEndpoint: 'entities', baseFilter: { type: 'country' } },
  },
  {
    Header: 'Message',
    source: 'message',
    type: 'tooltip',
    editable: false,
  },
  {
    Header: 'Project Code',
    source: 'project.code',
    editable: false,
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
          Header: 'Note',
          source: 'note',
          editConfig: { type: 'textarea' },
        },
      ],
    },
  },
];

export const AccessRequestsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Access Requests"
    endpoint="accessRequests"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit & Approve Access Request',
    }}
    baseFilter={{ approved: null }}
    getHeaderEl={getHeaderEl}
  />
);

AccessRequestsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
