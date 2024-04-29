/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';
import { COLUMNS as ENTITIES_COLUMNS } from './EntitiesPage';

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

const EXPANSION_CONFIG = [
  {
    title: 'Entities',
    endpoint: 'countries/{id}/entities',
    columns: ENTITIES_COLUMNS,
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

export const CountriesPage = props => (
  <ResourcePage
    title="Countries"
    endpoint="countries"
    columns={FIELDS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
    {...props}
  />
);
