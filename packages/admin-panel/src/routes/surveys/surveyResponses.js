/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { getBrowserTimeZone } from '@tupaia/utils';
import moment from 'moment';
import { ApprovalStatus } from '@tupaia/types';
import { SurveyResponsesExportModal } from '../../importExport';

// Don't include not_required as an editable option because it can lead to
// mis-matches between surveys and survey responses
export const APPROVAL_STATUS_TYPES = Object.values(ApprovalStatus).map(type => ({
  label: type,
  value: type,
}));

const surveyName = {
  Header: 'Survey',
  source: 'survey.name',
  editable: false,
  type: 'tooltip',
};

const surveyId = {
  Header: 'Survey Id',
  source: 'survey.id',
  editable: false,
  type: 'tooltip',
  show: false,
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
  accessor: row => moment(row.end_time).local().format('ddd, MMM Do YYYY, HH:mm:ss ZZ'),
  filterable: false,
  editable: false,
};

const dateOfData = {
  Header: 'Date of Data',
  source: 'data_time',
  type: 'tooltip',
  accessor: row => moment.parseZone(row.data_time).format('ddd, MMM Do YYYY, HH:mm:ss'),
  filterable: false,
  editConfig: {
    type: 'datetime-utc',
    accessor: record => moment.parseZone(record.data_time).toString(),
  },
};

const outdated = {
  Header: 'Outdated',
  source: 'outdated',
  type: 'boolean',
};

const approvalStatus = {
  Header: 'Approval Status',
  source: 'approval_status',
  type: 'tooltip',
};

const entityName = {
  Header: 'Entity',
  source: 'entity.name',
  editConfig: {
    optionsEndpoint: 'entities',
  },
};

const countryName = {
  Header: 'Country',
  source: 'country.name',
};

export const SURVEY_RESPONSE_COLUMNS = [
  surveyId,
  surveyName,
  assessorName,
  date,
  dateOfData,
  outdated,
  approvalStatus,
  {
    Header: 'Export',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'surveyResponses',
      extraQueryParameters: {
        timeZone: getBrowserTimeZone(),
      },
    },
  },
];

export const SURVEY_RESPONSE_PAGE_COLUMNS = [
  countryName,
  entityName,
  ...SURVEY_RESPONSE_COLUMNS,
  {
    Header: 'Resubmit',
    type: 'resubmitSurveyResponse',
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: 'surveyResponses',
    },
  },
];

export const ANSWER_COLUMNS = [
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

const IMPORT_CONFIG = {
  title: 'Import Survey Responses',
  actionConfig: {
    importEndpoint: 'surveyResponses',
    extraQueryParameters: {
      timeZone: getBrowserTimeZone(),
      respondWithEmailTimeout: 10 * 1000, // if an import doesn't finish in 10 seconds, email results
    },
  },
  queryParameters: [
    {
      label: 'Surveys',
      secondaryLabel:
        'Please enter the surveys for the responses to be imported against. Each tab in the file should be a matching survey code. Leave blank to import all tabs.',
      parameterKey: 'surveyCodes',
      optionsEndpoint: 'surveys',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
  ],
};

export const surveyResponses = {
  title: 'Survey Responses',
  url: '/survey-responses',
  endpoint: 'surveyResponses',
  columns: SURVEY_RESPONSE_PAGE_COLUMNS,
  importConfig: IMPORT_CONFIG,
  defaultFilters: [{ id: 'outdated', value: false }],
  defaultSorting: [{ id: 'data_time', desc: true }],
  ExportModalComponent: SurveyResponsesExportModal,
  detailsView: {
    title: 'Answers',
    columns: ANSWER_COLUMNS,
    endpoint: 'surveyResponses/{id}/answers',
    url: '/:id/answers',
    displayValue: 'survey.name',
  },
};
