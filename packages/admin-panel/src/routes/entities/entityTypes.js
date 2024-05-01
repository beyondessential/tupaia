/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

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
  title: 'Entity types',
  url: '/entityTypes',
  endpoint: ENTITY_TYPES_ENDPOINT,
  columns: ENTITY_TYPES_COLUMNS,
};
