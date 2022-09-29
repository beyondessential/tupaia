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

const FIELDS = [
  ...ENTITY_TYPES_COLUMNS,
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      title: 'Edit Entity Type',
      editEndpoint: ENTITY_TYPES_ENDPOINT,
      fields: ENTITY_TYPES_COLUMNS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: ENTITY_TYPES_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  title: 'New Entity Type',
  actionConfig: {
    title: 'Create New Entity Type',
    editEndpoint: ENTITY_TYPES_ENDPOINT,
    fields: ENTITY_TYPES_COLUMNS,
  },
};

export const EntityTypesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Entity Types"
    endpoint={ENTITY_TYPES_ENDPOINT}
    columns={FIELDS}
    getHeaderEl={getHeaderEl}
    createConfig={CREATE_CONFIG}
  />
);

EntityTypesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
