/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';
import {
  COUNTRY_PERMISSION_COLUMNS,
  GEOGRAPHICAL_AREA_PERMISSION_COLUMNS,
  FACILITY_PERMISSION_COLUMNS,
} from './PermissionsPage';

const FIELDS = [
  {
    Header: 'Email Address',
    source: 'email',
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
    Header: 'Password',
    source: 'password',
    hideValue: true,
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
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    width: 150,
    actionConfig: {
      editEndpoint: 'user',
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
    title: 'Country Permissions',
    endpoint: 'userCountryPermissions',
    columns: COUNTRY_PERMISSION_COLUMNS,
  },
  {
    title: 'Geographical Area Permissions',
    endpoint: 'userGeographicalAreaPermissions',
    columns: GEOGRAPHICAL_AREA_PERMISSION_COLUMNS,
  },
  {
    title: 'Facility Permissions',
    endpoint: 'userClinicPermissions',
    columns: FACILITY_PERMISSION_COLUMNS,
  },
];

const EDIT_CONFIG = {
  title: 'Edit User',
};

const IMPORT_CONFIG = {
  title: 'Import Users',
  actionConfig: {
    importEndpoint: 'users',
  },
};

const CREATE_CONFIG = {
  title: 'New User',
  actionConfig: {
    editEndpoint: 'userAccount', // Bit of a hack to avoid the /user route that the app uses
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

export const UsersPage = () => (
  <ResourcePage
    title="Users"
    endpoint="users"
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    editConfig={EDIT_CONFIG}
    createConfig={CREATE_CONFIG}
  />
);
