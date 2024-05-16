/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
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
    disableSortBy: true,
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
        required: true,
      },
      {
        Header: 'Parent',
        source: 'parent_id',
        required: true,
        editConfig: {
          optionsEndpoint: 'permissionGroups',
        },
      },
    ],
  },
};

export const permissionGroups = {
  title: 'Permission groups',
  path: '/permission-groups',
  endpoint: 'permissionGroups',
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  defaultSorting: [{ id: 'name', desc: false }],
};
