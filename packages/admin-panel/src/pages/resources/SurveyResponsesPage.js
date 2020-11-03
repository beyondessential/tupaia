/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ResourcePage } from './ResourcePage';
import { SurveyResponsesExportModal } from '../../importExport';

const surveyName = {
  Header: 'Survey',
  source: 'survey.name',
  editable: false,
  type: 'tooltip',
};

const assessorName = {
  Header: 'Assessor',
  source: 'assessor_name',
  editable: false,
};

const date = {
  Header: 'Date of Survey',
  source: 'end_time',
  type: 'tooltip',
  accessor: row => moment(row.end_time).local().toString(),
  filterable: false,
  editable: false,
};

const dateOfData = {
  Header: 'Date of Data',
  source: 'submission_time',
  type: 'tooltip',
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
    filterable: false,
    width: 80,
    source: 'id',
    type: 'filteredExport',
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
    type: 'tooltip',
  },
  {
    Header: 'Answer',
    source: 'text',
    type: 'tooltip',
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

const FILTERED_EXPORT_CONFIG = {
  title: 'Export Survey Responses',
  actionConfig: {
    exportEndpoint: 'surveyResponses',
    rowIdQueryParameter: 'countryId',
    fileName: '{name} Survey Responses',
  },
  queryParameters: [
    {
      label: 'Surveys to Include',
      secondaryLabel: 'Please enter the names of the surveys to be exported.',
      parameterKey: 'surveyCodes',
      optionsEndpoint: 'country/{id}/surveys',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
    {
      label: 'Country to Include',
      secondaryLabel: 'Please enter the names of the surveys to be exported.',
      parameterKey: 'countries',
      optionsEndpoint: 'country',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
    {
      label: 'Entities to Include',
      secondaryLabel: 'Please enter the names of the entities to be exported.',
      parameterKey: 'entities',
      optionsEndpoint: 'entity',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
    {
      label: 'Start Date',
      parameterKey: 'startDate',
      type: 'datetime-local',
    },
    {
      label: 'End Date',
      parameterKey: 'endDate',
      type: 'datetime-local',
    },
  ],
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
    ExportModalComponent={SurveyResponsesExportModal}
  />
);

SurveyResponsesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
