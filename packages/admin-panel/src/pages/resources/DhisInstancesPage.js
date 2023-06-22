/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

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
  title: 'New Dhis Instance',
  actionConfig: {
    editEndpoint: 'dhisInstances',
    fields: FIELDS,
  },
};

export const DhisInstancesPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="DHIS Instances"
    endpoint="dhisInstances"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...props}
  />
);

DhisInstancesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
