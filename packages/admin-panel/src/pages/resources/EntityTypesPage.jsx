/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const ENTITY_TYPES_ENDPOINT = 'entityTypes';

export const ENTITY_TYPES_COLUMNS = [
  { source: 'id', show: false },
  {
    Header: 'Type',
    source: 'type',
    filterable: false,
    sortable: false,
  },
];

const CREATE_CONFIG = {
  title: 'Add a new entity type',
  actionConfig: {
    editEndpoint: ENTITY_TYPES_ENDPOINT,
    fields: [
      {
        Header: 'Type',
        source: 'type',
      },
    ],
  },
};

export const EntityTypesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Entity Types"
    endpoint={ENTITY_TYPES_ENDPOINT}
    columns={ENTITY_TYPES_COLUMNS}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

EntityTypesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
