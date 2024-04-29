/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

const RESOURCE_NAME = { singular: 'DHIS instance' };

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Readonly',
    source: 'readonly',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
    },
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
      default: '{}',
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dhisInstances',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: `dhisInstances`,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'dhisInstances',
    fields: FIELDS,
  },
};

export const DhisInstancesPage = props => (
  <ResourcePage
    resourceName={RESOURCE_NAME}
    endpoint="dhisInstances"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    {...props}
  />
);
