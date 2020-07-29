/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
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

export const PermissionGroupsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Permission Groups"
    endpoint="permissionGroups"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

PermissionGroupsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
