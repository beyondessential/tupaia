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
          optionLabelKey: 'name',
          optionValueKey: 'id',
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
