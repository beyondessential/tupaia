/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { COLUMNS as ENTITIES_COLUMNS } from './entities';

const FIELDS = [
  { source: 'id', show: false },
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Code',
    source: 'code',
  },
];

const CREATE_CONFIG = {
  title: 'New Country',
  actionConfig: {
    title: 'Create New Country',
    editEndpoint: 'countries',
    fields: FIELDS,
  },
};

export const countries = {
  title: 'Countries',
  endpoint: 'countries',
  url: '/countries',
  columns: FIELDS,
  createConfig: CREATE_CONFIG,
  detailsView: {
    title: 'Entities',
    endpoint: 'countries/{id}/entities',
    columns: ENTITIES_COLUMNS,
    url: '/:id/entities',
    displayProperty: 'name',
  },
};
