/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import {
  DATA_ELEMENT_FIELD_EDIT_CONFIG,
  SERVICE_TYPE_OPTIONS,
  DataSourceConfigView,
} from '../../common';

const FIELDS = [
  {
    Header: 'Data Element',
    source: 'data_element_code',
  },
  {
    Header: 'Country Code',
    source: 'country_code',
  },
  {
    Header: 'Service Type',
    source: 'service_type',
    editConfig: {
      options: SERVICE_TYPE_OPTIONS,
    },
  },
  {
    Header: 'Data Service Configuration',
    source: 'service_config',
    Cell: DataSourceConfigView,
    editConfig: DATA_ELEMENT_FIELD_EDIT_CONFIG,
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dataElementDataServices',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: `dataElementDataServices`,
    },
  },
];

const IMPORT_CONFIG = {
  title: 'Import Mapping',
  actionConfig: {
    importEndpoint: 'dataElementDataServices',
  },
};

const CREATE_CONFIG = {
  title: 'New Mapping',
  actionConfig: {
    editEndpoint: 'dataElementDataServices',
    fields: FIELDS,
  },
};

export const DataElementDataServicesPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="Data Mapping"
    endpoint="dataElementDataServices"
    columns={COLUMNS}
    importConfig={IMPORT_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...props}
  />
);

DataElementDataServicesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
