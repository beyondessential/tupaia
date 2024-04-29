/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

const RESOURCE_NAME = { singular: 'superset instance' };

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
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
      editEndpoint: 'supersetInstances',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'supersetInstances',
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'supersetInstances',
    fields: FIELDS,
  },
};

export const SupersetInstancesPage = props => (
  <ResourcePage
    resourceName={RESOURCE_NAME}
    title="mSupply superset instances"
    endpoint="supersetInstances"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    {...props}
  />
);
