import {
  DATA_ELEMENT_FIELD_EDIT_CONFIG,
  DataSourceConfigView,
  SERVICE_TYPE_OPTIONS,
} from '../../common';

const RESOURCE_NAME = { singular: 'mapping' };

const FIELDS = [
  {
    Header: 'Data element',
    source: 'data_element_code',
    required: true,
  },
  {
    Header: 'Country code',
    source: 'country_code',
    required: true,
  },
  {
    Header: 'Service type',
    source: 'service_type',
    required: true,
    editConfig: {
      options: SERVICE_TYPE_OPTIONS,
    },
  },
  {
    Header: 'Data service configuration',
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
  title: `Import ${RESOURCE_NAME.singular}`,
  actionConfig: {
    importEndpoint: 'dataElementDataServices',
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
};

const CREATE_CONFIG = {
  actionConfig: {
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
