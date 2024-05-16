/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import {
  DATA_ELEMENT_FIELD_EDIT_CONFIG,
  SERVICE_TYPE_OPTIONS,
  DataSourceConfigView,
} from '../../common';

const FIELDS = [
  {
    Header: 'Data Element',
    source: 'data_element_code',
    required: true,
  },
  {
    Header: 'Country Code',
    source: 'country_code',
    required: true,
  },
  {
    Header: 'Service Type',
    source: 'service_type',
    required: true,
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

export const dataMapping = {
  title: 'Data mapping',
  path: '/data-mapping',
  endpoint: 'dataElementDataServices',
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  createConfig: CREATE_CONFIG,
  isBESAdminOnly: true,
};
