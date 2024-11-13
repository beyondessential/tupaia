/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { SURVEY_RESPONSE_COLUMNS } from '../surveys/surveyResponses';
import { getPluralForm } from '../../pages/resources/resourceName';

const RESOURCE_NAME = { singular: 'entity', plural: 'entities' };

const ENTITIES_ENDPOINT = 'entities';

export const FIELDS = {
  id: { source: 'id', show: false },
  code: {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  name: {
    Header: 'Name',
    source: 'name',
    required: true,
  },
  type: {
    Header: 'Type',
    source: 'type',
    required: true,
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

export const QRCodeColumn = {
  Header: 'QR',
  type: 'qrCode',
  actionConfig: {
    qrCodeContentsKey: 'id',
    humanReadableIdKey: 'name',
    qrCodePrefix: 'entity-', // TODO: Consolidate id prefixing into a common util (RN-968)
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
      title: `Edit ${RESOURCE_NAME.singular}`,
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
  QRCodeColumn,
];

const IMPORT_CONFIG = {
  title: `Import ${getPluralForm(RESOURCE_NAME)}`,
  subtitle:
    'Please note that if this is the first time a country is being imported, you will need to restart central-server post-import for it to sync to DHIS2.', // hope to fix one day in https://github.com/beyondessential/central-server/issues/481
  actionConfig: {
    importEndpoint: ENTITIES_ENDPOINT,
    accept: {
      'application/geo+json': ['.geojson'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
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
      label: 'Automatically fetch GeoJSON (defaults to ‘Yes’)',
      parameterKey: 'automaticallyFetchGeojson',
      type: 'boolean',
      editConfig: {
        type: 'boolean',
      },
    },
  ],
};

export const entities = {
  resourceName: RESOURCE_NAME,
  path: '',
  default: true,
  endpoint: ENTITIES_ENDPOINT,
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  nestedViews: [
    {
      title: 'Survey responses',
      endpoint: `${ENTITIES_ENDPOINT}/{id}/surveyResponses`,
      columns: SURVEY_RESPONSE_COLUMNS,
      path: '/:id/surveyResponses',
      displayProperty: 'name',
      getNestedViewLink: ({ id }) => `/surveys/survey-responses/${id}/answers`,
    },
  ],
};
