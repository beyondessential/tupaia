/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SurveyResponsesPage, SURVEY_RESPONSE_COLUMNS } from '@tupaia/admin-panel/lib';
import { ApproveButton, RejectButton } from '../../components';

export const ApprovedSurveyResponsesView = props => (
  <SurveyResponsesPage
    title="Approved Survey Responses"
    baseFilter={{ approval_status: { comparisonValue: 'approved' } }}
    {...props}
  />
);

export const RejectedSurveyResponsesView = props => (
  <SurveyResponsesPage
    title="Rejected Survey Responses"
    baseFilter={{ approval_status: { comparisonValue: 'rejected' } }}
    {...props}
  />
);

export const NonApprovalSurveyResponsesView = props => (
  <SurveyResponsesPage
    title="Approval Not Required Survey Responses"
    baseFilter={{ approval_status: { comparisonValue: 'not_required' } }}
    {...props}
  />
);

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
    Cell: ApproveButton,
    filterable: false,
    sortable: false,
    width: 75,
  },
  {
    Header: 'Reject',
    source: 'id',
    Cell: RejectButton,
    type: 'delete',
    actionConfig: {
      endpoint: 'surveyResponses',
    },
  },
];

export const DraftSurveyResponsesView = props => (
  <SurveyResponsesPage
    {...props}
    title="Survey Responses For Review"
    baseFilter={{ approval_status: { comparisonValue: 'pending' } }}
    columns={COLUMNS}
  />
);
