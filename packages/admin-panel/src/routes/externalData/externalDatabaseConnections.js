/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT = 'externalDatabaseConnections';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Description',
    source: 'description',
  },
  {
    Header: 'Permission groups',
    source: 'permission_groups',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'permission_groups',
      allowMultipleValues: true,
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
      title: 'Edit External Database Connection',
      fields: [...FIELDS],
    },
  },
  {
    Header: 'Test',
    type: 'testDatabaseConnection',
    colWidth: 100,
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  title: 'Create a new External Database Connection',
  actionConfig: {
    editEndpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
    fields: [...FIELDS],
  },
};

export const externalDatabaseConnections = {
  title: 'External database connections',
  path: '',
  endpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
