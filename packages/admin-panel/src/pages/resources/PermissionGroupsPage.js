/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { prettyArray } from '../../utilities';

const COLUMNS = [
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Ancestors',
    source: 'ancestors',
    filterable: false,
    // eslint-disable-next-line react/prop-types
    Cell: ({ value: ancestors }) => (ancestors.length > 0 ? prettyArray(ancestors) : <ul> - </ul>),
    accessor: ({ ancestors }) => ancestors.map(a => a.name).reverse(),
  },
];

const CREATE_CONFIG = {
  title: 'Create Permission Group',
  actionConfig: {
    title: 'Edit Permission Group',
    editEndpoint: 'permissionGroups',
    fields: [
      {
        Header: 'Name',
        source: 'name',
      },
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
    defaultSorting={[{ id: 'name', desc: false }]}
  />
);

PermissionGroupsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
