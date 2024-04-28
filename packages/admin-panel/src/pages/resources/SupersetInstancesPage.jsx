/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

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
    actionConfig: {
      editEndpoint: 'supersetInstances',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: `supersetInstances`,
    },
  },
];

const CREATE_CONFIG = {
  title: 'New Superset Instance',
  actionConfig: {
    editEndpoint: 'supersetInstances',
    fields: FIELDS,
  },
};

export const SupersetInstancesPage = props => (
  <ResourcePage
    title="mSupply Superset Instances"
    endpoint="supersetInstances"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    {...props}
  />
);
