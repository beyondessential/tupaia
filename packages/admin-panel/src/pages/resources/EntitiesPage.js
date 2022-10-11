/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { SURVEY_RESPONSE_COLUMNS, ANSWER_COLUMNS } from './SurveyResponsesPage';

const ENTITIES_ENDPOINT = 'entities';

export const ENTITIES_COLUMNS = [
  { source: 'id', show: false },
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Name',
    source: 'name',
    type: 'tooltip',
  },
  {
    Header: 'Type',
    source: 'type',
  },
];

const FIELDS = [
  ...ENTITIES_COLUMNS,
  {
    Header: 'Country',
    source: 'country_code',
  },
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      editEndpoint: ENTITIES_ENDPOINT,
      title: 'Edit Entity',
      fields: [
        {
          Header: 'Name',
          source: 'name',
        },
      ],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: ENTITIES_ENDPOINT,
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Survey Responses',
    endpoint: 'entities/{id}/surveyResponses',
    columns: SURVEY_RESPONSE_COLUMNS,
    expansionTabs: [
      {
        title: 'Answers',
        endpoint: 'surveyResponses/{id}/answers',
        columns: ANSWER_COLUMNS,
      },
    ],
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

export const EntitiesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Entities"
    endpoint={ENTITIES_ENDPOINT}
    columns={FIELDS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

EntitiesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
