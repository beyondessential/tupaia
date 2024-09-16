/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Tooltip as TooltipComponent } from '@tupaia/ui-components';
import { VerifiedFilter } from '../../table/columnTypes/columnFilters';
import { PERMISSIONS_COLUMNS, PERMISSIONS_ENDPOINT } from './permissions';
import { getPluralForm } from '../../pages/resources/resourceName';

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

const FIELDS = {
  first_name: {
    Header: 'First Name',
    source: 'first_name',
    required: true,
  },
  last_name: {
    Header: 'Last Name',
    source: 'last_name',
    required: true,
  },
  email: {
    Header: 'Email address',
    source: 'email',
    required: true,
  },
  phone: {
    Header: 'Phone number',
    source: 'mobile_number',
  },
  position: {
    Header: 'Position',
    source: 'position',
  },
  employer: {
    Header: 'Employer',
    source: 'employer',
  },
  verified: {
    Header: 'Verified',
    source: 'verified_email',
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
  password: {
    Header: 'Password',
    source: 'password',
    hideValue: true,
    editConfig: {
      type: 'password',
    },
  },
};

const EDIT_FIELDS = [
  FIELDS.first_name,
  FIELDS.last_name,
  FIELDS.email,
  FIELDS.phone,
  FIELDS.position,
  FIELDS.employer,
  FIELDS.verified,
  FIELDS.password,
];

const CREATE_FIELDS = [
  FIELDS.first_name,
  FIELDS.last_name,
  FIELDS.email,
  FIELDS.phone,
  FIELDS.position,
  FIELDS.employer,
  FIELDS.verified,
  {
    ...FIELDS.password,
    required: true,
  },
  {
    Header: 'Country',
    source: 'countryName',
    required: true,
    editConfig: {
      sourceKey: 'countryName',
      optionsEndpoint: 'countries',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      labelTooltip: 'Select the country to grant this user access to',
    },
  },
  {
    Header: 'Permission group',
    source: 'permissionGroupName',
    required: true,
    editConfig: {
      sourceKey: 'permissionGroupName',
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      labelTooltip: 'Select the permission group to grant this user access to',
    },
  },
  {
    Header: 'API Client (not required for most users, see README of admin-panel for usage)',
    source: 'is_api_client',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
    },
  },
];

const COLUMNS = [
  {
    Header: 'First name',
    source: 'first_name',
    width: 150,
  },
  {
    Header: 'Last name',
    source: 'last_name',
    width: 150,
  },
  {
    Header: 'Email Address',
    source: 'email',
  },
  {
    Header: 'Employer',
    source: 'employer',
  },
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
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'users',
      fields: EDIT_FIELDS,
    },
  },
];

const IMPORT_CONFIG = {
  title: `Import ${getPluralForm(RESOURCE_NAME)}`,
  actionConfig: {
    importEndpoint: 'users',
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
};

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'users',
    fields: CREATE_FIELDS,
  },
};

export const users = {
  resourceName: RESOURCE_NAME,
  path: '',
  endpoint: 'users',
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  createConfig: CREATE_CONFIG,
  nestedViews: [
    {
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
  ],
};
