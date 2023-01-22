/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { DataTableEditFields } from '../../dataTables/DataTableEditFields';

const DATA_TABLES_ENDPOINT = 'dataTables';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Description',
    source: 'description',
  },
  {
    Header: 'Type',
    source: 'type',
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Permission groups',
    source: 'permission_groups',
    type: 'tooltip',
    editConfig: {
      type: 'jsonArray',
    },
  },
];

const COLUMNS = [...FIELDS];

const CREATE_CONFIG = {
  title: 'New Data Table',
  actionConfig: {
    editEndpoint: DATA_TABLES_ENDPOINT,
    fields: FIELDS,
    FieldsComponent: DataTableEditFields,
    extraDialogProps: {
      fullWidth: true,
      maxWidth: 'xl',
    },
  },
};

export const DataTablesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Data-Tables"
    endpoint={DATA_TABLES_ENDPOINT}
    columns={COLUMNS}
    getHeaderEl={getHeaderEl}
    createConfig={CREATE_CONFIG}
  />
);

DataTablesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
