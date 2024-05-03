/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { SURVEY_RESPONSE_COLUMNS } from '../surveys/surveyResponses';

const ENTITIES_ENDPOINT = 'entities';

export const FIELDS = {
  id: { source: 'id', show: false },
  code: {
    Header: 'Code',
    source: 'code',
  },
  name: {
    Header: 'Name',
    source: 'name',
    type: 'tooltip',
  },
  type: {
    Header: 'Type',
    source: 'type',
  },
  attributes: {
    Header: 'Attributes',
    source: 'attributes',
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
    },
  },
};

export const COLUMNS = [
  ...Object.values(FIELDS),
  {
    Header: 'Country',
    source: 'country_code',
  },
  {
    Header: 'Edit',
    type: 'edit',
    actionConfig: {
      editEndpoint: ENTITIES_ENDPOINT,
      title: 'Edit Entity',
      fields: [FIELDS.name, FIELDS.attributes],
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: ENTITIES_ENDPOINT,
    },
  },
  {
    Header: 'QR',
    type: 'qrCode',
    actionConfig: {
      qrCodeContentsKey: 'id',
      humanReadableIdKey: 'name',
      qrCodePrefix: 'entity-', // TODO: Consolidate id prefixing into a common util (RN-968)
    },
  },
];

const IMPORT_CONFIG = {
  title: 'Import Entities',
  subtitle:
    'Please note that if this is the first time a country is being imported, you will need to restart central-server post-import for it to sync to DHIS2.', // hope to fix one day in https://github.com/beyondessential/central-server/issues/481
  actionConfig: {
    importEndpoint: 'entities',
  },
  queryParameters: [
    {
      label: 'Push new entities to DHIS2 server',
      parameterKey: 'pushToDhis',
      type: 'boolean',
      editConfig: {
        type: 'boolean',
      },
    },
    {
      label: 'Automatically fetch GeoJSON (defaults to "Yes")',
      parameterKey: 'automaticallyFetchGeojson',
      type: 'boolean',
      editConfig: {
        type: 'boolean',
      },
    },
  ],
};

export const entities = {
  title: 'Entities',
  path: '',
  default: true,
  endpoint: ENTITIES_ENDPOINT,
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  detailsView: {
    title: 'Survey Responses',
    endpoint: 'entities/{id}/surveyResponses',
    columns: SURVEY_RESPONSE_COLUMNS,
    path: '/:id/surveyResponses',
    displayProperty: 'name',
    getLink: ({ id }) => `/surveys/survey-responses/${id}/answers`,
  },
};
