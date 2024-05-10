/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DATA_ELEMENT_FIELDS, getDataSourceButtonsConfig } from '../../common';

const RESOURCE_NAME = { singular: 'data element' };

const IMPORT_CONFIG = {
  title: `Import ${RESOURCE_NAME.singular}`,
  actionConfig: {
    importEndpoint: 'dataElements',
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
      title: `New ${RESOURCE_NAME.singular}`,
      editEndpoint: 'dataElements',
      fields: [...DATA_ELEMENT_FIELDS],
    },
  },
  editorConfig: EDITOR_CONFIG,
};
