/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import {
  DATA_ELEMENT_FIELD_EDIT_CONFIG,
  DataSourceConfigView,
  SERVICE_TYPE_OPTIONS,
} from '../../common';

const RESOURCE_NAME = { singular: 'mapping' };

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
  actionConfig: {
    title: `New ${RESOURCE_NAME.singular}`,
    editEndpoint: 'dataElementDataServices',
    fields: FIELDS,
  },
};

export const dataMapping = {
  title: 'Data mapping',
  resourceName: RESOURCE_NAME,
  path: '/data-mapping',
  endpoint: 'dataElementDataServices',
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  createConfig: CREATE_CONFIG,
  isBESAdminOnly: true,
};
