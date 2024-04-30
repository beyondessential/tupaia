/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
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

export const EntityTypesPage = () => (
  <ResourcePage
    title="Entity Types"
    endpoint={ENTITY_TYPES_ENDPOINT}
    columns={ENTITY_TYPES_COLUMNS}
  />
);
