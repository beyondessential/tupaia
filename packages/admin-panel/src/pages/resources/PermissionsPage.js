/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

// export for use on users page
export const PERMISSIONS_ENDPOINT = 'userEntityPermissions';
export const PERMISSIONS_COLUMNS = [
  {
    Header: 'Entity',
    source: 'entity.name',
    editConfig: {
      optionsEndpoint: 'entities',
      baseFilter: { type: 'country' },
    },
  },
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
    },
  },
];

const FIELDS = [
  {
    Header: 'User',
    source: 'user.first_name',
    accessor: rowData => `${rowData['user.first_name']} ${rowData['user.last_name']}`,
    editable: false,
  },
  {
    source: 'user.last_name',
    show: false,
  },
  ...PERMISSIONS_COLUMNS,
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      editEndpoint: PERMISSIONS_ENDPOINT,
      fields: PERMISSIONS_COLUMNS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: PERMISSIONS_ENDPOINT,
    },
  },
];

const EDIT_CONFIG = {
  title: "Edit User's Permission",
};

const CREATE_CONFIG = {
  title: 'Give User Permission',
  actionConfig: {
    editEndpoint: PERMISSIONS_ENDPOINT,
    fields: [
      {
        Header: 'User Email',
        source: 'user.email',
        editConfig: {
          optionsEndpoint: 'users',
          optionLabelKey: 'email',
        },
      },
      ...PERMISSIONS_COLUMNS,
    ],
  },
};

export const PermissionsPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="Permissions"
    endpoint={PERMISSIONS_ENDPOINT}
    columns={FIELDS}
    editConfig={EDIT_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...props}
  />
);

PermissionsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
