/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';
import { COLUMNS as ENTITIES_COLUMNS } from './EntitiesPage';

const RESOURCE_NAME = { singular: 'country', plural: 'countries' };

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
  actionConfig: {
    editEndpoint: 'countries',
    fields: FIELDS,
  },
};

export const CountriesPage = () => (
  <ResourcePage
    resourceName={RESOURCE_NAME}
    endpoint="countries"
    columns={FIELDS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
  />
);
