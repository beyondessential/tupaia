/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';
import { prettyArray } from '../../utilities';

const RESOURCE_NAME = { singular: 'permission group' };

const COLUMNS = [
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Ancestors',
    source: 'ancestors',
    filterable: false,
    sortable: false,
    // eslint-disable-next-line react/prop-types
    Cell: ({ value: ancestors }) => (ancestors.length > 0 ? prettyArray(ancestors) : <ul> - </ul>),
    accessor: ({ ancestors }) => ancestors.map(a => a.name).reverse(),
  },
];

const CREATE_CONFIG = {
  actionConfig: {
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

export const PermissionGroupsPage = props => (
  <ResourcePage
    resourceName={RESOURCE_NAME}
    endpoint="permissionGroups"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    defaultSorting={[{ id: 'name', desc: false }]}
    {...props}
  />
);
