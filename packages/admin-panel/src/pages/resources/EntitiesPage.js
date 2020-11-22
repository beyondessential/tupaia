/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { SURVEY_RESPONSE_COLUMNS, ANSWER_COLUMNS } from './SurveyResponsesPage';

export const ENTITIES_COLUMNS = [
  {
    Header: 'Name',
    source: 'name',
    type: 'tooltip',
  },
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Type',
    source: 'type',
  },
  {
    Header: 'Export Survey Responses',
    source: 'id',
    type: 'export',
    width: 200,
    actionConfig: {
      exportEndpoint: 'surveyResponses',
      rowIdQueryParameter: 'entityIds',
      fileName: '{name} Survey Responses',
    },
  },
];

const COLUMNS = [
  {
    Header: 'Country',
    source: 'country_code',
  },
  ...ENTITIES_COLUMNS,
];

const EXPANSION_CONFIG = [
  {
    title: 'Survey Responses',
    endpoint: 'entity/{id}/surveyResponses',
    columns: SURVEY_RESPONSE_COLUMNS,
    expansionTabs: [
      {
        title: 'Answers',
        endpoint: 'surveyResponse/{id}/answers',
        columns: ANSWER_COLUMNS,
      },
    ],
  },
];

const IMPORT_CONFIG = {
  title: 'Import Entities',
  subtitle:
    'Please note that if this is the first time a country is being imported, you will need to restart meditrak-server post-import for it to sync to DHIS2.', // hope to fix one day in https://github.com/beyondessential/meditrak-server/issues/481
  actionConfig: {
    importEndpoint: 'entities',
  },
};

export const EntitiesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Entities"
    endpoint="entities"
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

EntitiesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
