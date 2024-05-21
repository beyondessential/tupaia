/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'entity type' };

const ENTITY_TYPES_ENDPOINT = 'entityTypes';

export const ENTITY_TYPES_COLUMNS = [
  { source: 'id', show: false },
  {
    Header: 'Type',
    source: 'type',
    filterable: false,
    disableSortBy: true,
  },
];

export const entityTypes = {
  resourceName: RESOURCE_NAME,
  path: '/entityTypes',
  endpoint: ENTITY_TYPES_ENDPOINT,
  columns: ENTITY_TYPES_COLUMNS,
};
