/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
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
    disableSortBy: true,
    // eslint-disable-next-line react/prop-types
    Cell: ({ value: ancestors }) =>
      ancestors.length > 0 ? prettyArray(ancestors) : <ul>&mdash;</ul>,
    accessor: ({ ancestors }) => ancestors.map(a => a.name).reverse(),
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    title: `New ${RESOURCE_NAME.singular}`,
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

export const permissionGroups = {
  resourceName: RESOURCE_NAME,
  path: '/permission-groups',
  endpoint: 'permissionGroups',
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  defaultSorting: [{ id: 'name', desc: false }],
};
