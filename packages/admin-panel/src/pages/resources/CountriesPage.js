/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { ENTITIES_COLUMNS } from './EntitiesPage';

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
    endpoint: 'country/{id}/entities',
    columns: ENTITIES_COLUMNS,
  },
];

const CREATE_CONFIG = {
  title: 'New Country',
  actionConfig: {
    editEndpoint: 'country',
    fields: FIELDS,
  },
};

export const CountriesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Countries"
    endpoint="countries"
    columns={FIELDS}
    expansionTabs={EXPANSION_CONFIG}
    editConfig={{ title: 'Create New Country' }}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

CountriesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
