/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

const COLUMNS = [
  {
    Header: 'Name',
    source: 'name',
  },
];

const CREATE_CONFIG = {
  title: 'Create Permission Group',
  actionConfig: {
    editEndpoint: 'permissionGroups',
    fields: [
      ...COLUMNS,
      {
        Header: 'Parent',
        source: 'parent_id',
        editConfig: {
          optionsEndpoint: 'permissionGroups',
        },
      },
    ],
  },
};

export const PermissionGroupsPage = props => (
  <ResourcePage
    title="Permission Groups"
    endpoint="permissionGroups"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    {...props}
  />
);
