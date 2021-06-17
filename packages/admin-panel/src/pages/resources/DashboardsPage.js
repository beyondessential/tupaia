/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Organisation Unit Code',
    source: 'root_entity_code',
    editConfig: {
      optionsEndpoint: 'entities',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'root_entity_code',
    },
  },
  {
    Header: 'Sort Order',
    source: 'sort_order',
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dashboards',
      fields: [...FIELDS],
    },
  },
];

export const DashboardsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Dashboards"
    endpoint="dashboards"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit Dashboard',
    }}
    getHeaderEl={getHeaderEl}
  />
);

DashboardsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
