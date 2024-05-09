/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Tooltip as TooltipComponent } from '@tupaia/ui-components';
import { VerifiedFilter } from '../../table/columnTypes/columnFilters';
import { PERMISSIONS_COLUMNS, PERMISSIONS_ENDPOINT } from './permissions';

const RESOURCE_NAME = { singular: 'user' };

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
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit User',
      editEndpoint: 'users',
      fields: EDIT_FIELDS,
    },
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
        Header: 'Country',
        source: 'countryName',
        editConfig: {
          sourceKey: 'countryName',
          optionsEndpoint: 'countries',
          optionLabelKey: 'name',
          optionValueKey: 'name',
          secondaryLabel: 'Select the country to grant this user access to',
        },
      },
      {
        Header: 'Permission Group',
        source: 'permissionGroupName',
        editConfig: {
          sourceKey: 'permissionGroupName',
          optionsEndpoint: 'permissionGroups',
          optionLabelKey: 'name',
          optionValueKey: 'name',
          secondaryLabel: 'Select the permission group to grant this user access to',
        },
      },
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

export const users = {
  resourceName: RESOURCE_NAME,
  path: '',
  endpoint: 'users',
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  createConfig: CREATE_CONFIG,
  nestedView: {
    title: 'Permissions',
    endpoint: `users/{id}/${PERMISSIONS_ENDPOINT}`,
    columns: PERMISSIONS_COLUMNS,
    path: '/:id/permissions',
    getDisplayValue: user => {
      if (!user) return '';
      const { first_name: firstName, last_name: lastName } = user;
      return `${firstName} ${lastName}`;
    },
  },
};
