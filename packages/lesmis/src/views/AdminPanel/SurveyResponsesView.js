/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SurveyResponsesPage, SURVEY_RESPONSE_PAGE_COLUMNS } from '@tupaia/admin-panel';
import { ApproveButton, RejectButton } from '../../components';

const COLUMNS = SURVEY_RESPONSE_PAGE_COLUMNS.filter(
  column => column.source !== 'outdated' && column.source !== 'approval_status',
);

export const ApprovedSurveyResponsesView = props => (
  <SurveyResponsesPage
    title="Approved Survey Responses"
    baseFilter={{ approval_status: { comparisonValue: 'approved' } }}
    columns={[...COLUMNS.filter(column => column.type !== 'delete')]}
    {...props}
  />
);

export const RejectedSurveyResponsesView = props => (
  <SurveyResponsesPage
    title="Rejected Survey Responses"
    baseFilter={{ approval_status: { comparisonValue: 'rejected' } }}
    columns={[...COLUMNS.filter(column => column.type !== 'delete')]}
    {...props}
  />
);

const DRAFT_COLUMNS = [
  ...COLUMNS.filter(column => column.type !== 'delete'),
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
    columns={DRAFT_COLUMNS}
  />
);

// Don't include the approval column for the non-approval survey responses
const EDIT_CONFIG = COLUMNS.find(column => column.type === 'edit');
const EDIT_COLUMN = {
  ...EDIT_CONFIG,
  actionConfig: {
    ...EDIT_CONFIG.actionConfig,
    fields: EDIT_CONFIG.actionConfig.fields.filter(f => f.source !== 'approval_status'),
  },
};
const NON_APPROVAL_COLUMNS = [...COLUMNS.filter(column => column.type !== 'edit'), EDIT_COLUMN];

export const NonApprovalSurveyResponsesView = props => (
  <SurveyResponsesPage
    {...props}
    title="Approval Not Required Survey Responses"
    baseFilter={{ approval_status: { comparisonValue: 'not_required' } }}
    columns={NON_APPROVAL_COLUMNS}
  />
);
