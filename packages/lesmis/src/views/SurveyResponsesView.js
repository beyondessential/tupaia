/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import {
  IconButton,
  SurveyResponsesPage as ResourcePage,
  SURVEY_RESPONSE_COLUMNS,
} from '@tupaia/admin-panel/lib';
import CheckIcon from '@material-ui/icons/Check';

export const ApprovedSurveyResponsesView = props => (
  <ResourcePage
    title="Survey Responses (Approved)"
    baseFilter={{ 'survey.code': { comparator: 'ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
    {...props}
  />
);

// eslint-disable-next-line no-unused-vars
const ApproveCell = ({ value }) => {
  return (
    <IconButton onClick={() => console.log('click approve...')}>
      <CheckIcon />
    </IconButton>
  );
};

const entityName = {
  Header: 'Entity',
  source: 'entity.name',
  editConfig: {
    optionsEndpoint: 'entities',
  },
};

const { surveyName, assessorName, date, dateOfData } = SURVEY_RESPONSE_COLUMNS;

const COLUMNS = [
  entityName,
  ...SURVEY_RESPONSE_COLUMNS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'surveyResponses',
      fields: [entityName, surveyName, assessorName, date, dateOfData],
    },
  },
  {
    Header: 'Approve',
    source: 'id',
    Cell: ApproveCell,
    filterable: false,
    sortable: false,
    width: 75,
  },
  {
    Header: 'Reject',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'surveyResponses',
    },
  },
];

export const DraftSurveyResponsesView = props => (
  <ResourcePage
    {...props}
    title="Survey Responses (Review)1"
    baseFilter={{ 'survey.code': { comparator: 'NOT ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
    columns={COLUMNS}
  />
);
