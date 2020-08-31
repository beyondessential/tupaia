/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ResourcePage } from './ResourcePage';

const surveyName = {
  Header: 'Survey',
  source: 'survey.name',
  editable: false,
};

const assessorName = {
  Header: 'Assessor',
  source: 'assessor_name',
  editable: false,
};

const date = {
  Header: 'Date of Survey',
  source: 'end_time',
  accessor: row =>
    moment(row.end_time)
      .local()
      .toString(),
  filterable: false,
  editable: false,
};

const dateOfData = {
  Header: 'Date of Data',
  source: 'submission_time',
  accessor: row =>
    moment(row.submission_time || row.end_time)
      .local()
      .toString(),
  filterable: false,
  editConfig: {
    type: 'datetime-local',
  },
};

const entityName = {
  Header: 'Entity',
  source: 'entity.name',
  editConfig: {
    optionsEndpoint: 'entities',
  },
};

export const SURVEY_RESPONSE_COLUMNS = [
  surveyName,
  assessorName,
  date,
  dateOfData,
  {
    Header: 'Export',
    source: 'id',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'surveyResponse',
      fileName: 'Survey Response',
    },
  },
];

const COLUMNS = [
  entityName,
  ...SURVEY_RESPONSE_COLUMNS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'surveyResponse',
      fields: [entityName, surveyName, assessorName, date, dateOfData],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'surveyResponse',
    },
  },
];

const EDIT_CONFIG = {
  title: 'Edit Survey Response',
};

const ANSWER_FIELDS = [
  {
    Header: 'Question',
    source: 'question.text',
    editable: false,
  },
  {
    Header: 'Answer',
    source: 'text',
  },
];

export const ANSWER_COLUMNS = [
  ...ANSWER_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'answer',
      fields: ANSWER_FIELDS,
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Answers',
    columns: ANSWER_COLUMNS,
    endpoint: 'surveyResponse/{id}/answers',
  },
];

const IMPORT_CONFIG = {
  title: 'Import Survey Responses',
  actionConfig: {
    importEndpoint: 'surveyResponses',
  },
};

export const SurveyResponsesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Survey Responses"
    endpoint="surveyResponses"
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    editConfig={EDIT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

SurveyResponsesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
