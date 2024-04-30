/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DATA_ELEMENT_FIELDS, getDataSourceButtonsConfig } from '../../common';

const IMPORT_CONFIG = {
  title: 'Import Data Elements',
  actionConfig: {
    importEndpoint: 'dataElements',
  },
};

const EDITOR_CONFIG = {
  displayUsedBy: true,
};

export const dataElements = {
  title: 'Data elements',
  endpoint: 'dataElements',
  columns: [
    ...DATA_ELEMENT_FIELDS,
    ...getDataSourceButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement'),
  ],
  importConfig: IMPORT_CONFIG,
  url: '/data-elements',
  createConfig: {
    title: 'New Data Element',
    actionConfig: {
      title: 'Edit Data Element',
      editEndpoint: 'dataElements',
      fields: [...DATA_ELEMENT_FIELDS],
    },
  },
  editorConfig: EDITOR_CONFIG,
};
