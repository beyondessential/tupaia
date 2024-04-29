/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

const RESOURCE_NAME = { singular: 'entity type' };

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
    resourceName={RESOURCE_NAME}
    endpoint={ENTITY_TYPES_ENDPOINT}
    columns={ENTITY_TYPES_COLUMNS}
  />
);
