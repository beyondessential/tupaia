/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getBrowserTimeZone } from '@tupaia/utils';
import { ResourcePage } from './ResourcePage';
import { SurveyResponsesExportModal } from '../../importExport';

// Don't include not_required as an editable option because it can lead to
// mis-matches between surveys and survey responses
export const APPROVAL_STATUS_TYPES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Approved', value: 'approved' },
];

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

export const SURVEY_RESPONSE_COLUMNS = [
  surveyName,
  assessorName,
  date,
  dateOfData,
  outdated,
  approvalStatus,
  {
    Header: 'Export',
    source: 'id',
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
  entityName,
  ...SURVEY_RESPONSE_COLUMNS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Survey Response',
      editEndpoint: 'surveyResponses',
      fields: [
        entityName,
        surveyName,
        assessorName,
        date,
        dateOfData,
        {
          Header: 'Approval Status',
          source: 'approval_status',
          editConfig: {
            options: APPROVAL_STATUS_TYPES,
          },
        },
      ],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'surveyResponses',
    },
  },
];

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
      title: 'Edit Answer',
      editEndpoint: 'answers',
      fields: ANSWER_FIELDS,
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Answers',
    columns: ANSWER_COLUMNS,
    endpoint: 'surveyResponses/{id}/answers',
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

export const SurveyResponsesPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="Survey Responses"
    endpoint="surveyResponses"
    columns={SURVEY_RESPONSE_PAGE_COLUMNS}
    defaultFilters={[{ id: 'outdated', value: false }]}
    defaultSorting={[{ id: 'data_time', desc: true }]}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    getHeaderEl={getHeaderEl}
    ExportModalComponent={SurveyResponsesExportModal}
    {...props}
  />
);

SurveyResponsesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
