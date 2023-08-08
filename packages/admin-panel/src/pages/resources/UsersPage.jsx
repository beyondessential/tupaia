/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip as TooltipComponent } from '@tupaia/ui-components';
import { ResourcePage } from './ResourcePage';
import { PERMISSIONS_ENDPOINT, PERMISSIONS_COLUMNS } from './PermissionsPage';
import { VerifiedFilter } from '../../table/columnTypes/columnFilters';

// eslint-disable-next-line react/prop-types
const VerifiedCell = ({ value }) => {
  if (value === 'verified') {
    return 'Yes';
  }
  if (value === 'new_user') {
    return 'No';
  }
  return (
    <TooltipComponent title="Historical user which does not need verification">
      <div>Not Applicable</div>
    </TooltipComponent>
  );
};

const FIELDS = [
  {
    Header: 'Email Address',
    source: 'email',
    type: 'tooltip',
  },
  {
    Header: 'Phone Number',
    source: 'mobile_number',
  },
  {
    Header: 'Position',
    source: 'position',
  },
  {
    Header: 'Employer',
    source: 'employer',
    type: 'tooltip',
  },
];

const EDIT_FIELDS = [
  {
    Header: 'First Name',
    source: 'first_name',
  },
  {
    Header: 'Last Name',
    source: 'last_name',
  },
  ...FIELDS,
  {
    Header: 'Verified',
    source: 'verified_email',
    type: 'tooltip',
    editConfig: {
      options: [
        {
          label: 'No',
          value: 'new_user',
        },
        {
          label: 'Yes',
          value: 'verified',
        },
      ],
    },
  },
  {
    Header: 'Password',
    source: 'password',
    hideValue: true,
    editConfig: {
      type: 'password',
    },
  },
];

const COLUMNS = [
  {
    Header: 'First Name',
    source: 'first_name',
    width: 150,
  },
  {
    Header: 'Last Name',
    source: 'last_name',
    width: 150,
  },
  ...FIELDS,
  {
    Header: 'Verified',
    source: 'verified_email',
    Cell: VerifiedCell,
    Filter: VerifiedFilter,
  },
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    width: 150,
    actionConfig: {
      title: 'Edit User',
      editEndpoint: 'users',
      fields: EDIT_FIELDS,
    },
  },
  // Invisible columns
  {
    source: 'last_name',
    show: false,
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Permissions',
    endpoint: `users/{id}/${PERMISSIONS_ENDPOINT}`,
    columns: PERMISSIONS_COLUMNS,
  },
];

const IMPORT_CONFIG = {
  title: 'Import Users',
  actionConfig: {
    importEndpoint: 'users',
  },
};

const CREATE_CONFIG = {
  title: 'New User',
  actionConfig: {
    editEndpoint: 'users',
    fields: [
      ...EDIT_FIELDS,
      {
        Header: 'Api Client (Not required for most users, see Readme of admin-panel for usage)',
        source: 'is_api_client',
        type: 'boolean',
        editConfig: {
          type: 'boolean',
        },
      },
    ],
  },
};

export const UsersPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="Users"
    endpoint="users"
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...props}
  />
);

UsersPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
