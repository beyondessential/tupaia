import { DATA_ELEMENT_FIELDS, getDataSourceButtonsConfig } from '../../common';

export const RESOURCE_NAME = { singular: 'data element' };

const IMPORT_CONFIG = {
  title: `Import ${RESOURCE_NAME.singular}`,
  actionConfig: {
    importEndpoint: 'dataElements',
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
};

const EDITOR_CONFIG = {
  displayUsedBy: true,
};

export const dataElements = {
  resourceName: RESOURCE_NAME,
  endpoint: 'dataElements',
  columns: [
    ...DATA_ELEMENT_FIELDS,
    ...getDataSourceButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement'),
  ],
  importConfig: IMPORT_CONFIG,
  path: '/data-elements',
  createConfig: {
    actionConfig: {
      editEndpoint: 'dataElements',
      fields: DATA_ELEMENT_FIELDS,
    },
  },
  editorConfig: EDITOR_CONFIG,
};
