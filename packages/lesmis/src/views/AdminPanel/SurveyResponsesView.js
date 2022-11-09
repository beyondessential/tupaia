/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PropTypes } from 'prop-types';

import { SurveyResponsesPage } from '@tupaia/admin-panel';
import { ApproveButton, RejectButton } from '../../components';
import { getSurveyResponsePageColumns } from './utilities/getSurveyResponseColumns';

export const ApprovedSurveyResponsesView = props => {
  const COLUMNS = getSurveyResponsePageColumns(props.translate);

  return (
    <SurveyResponsesPage
      title={props.translate('admin.approvedSurveyResponses')}
      baseFilter={{ approval_status: { comparisonValue: 'approved' } }}
      columns={[...COLUMNS.filter(column => column.type !== 'delete')].map(column => ({
        ...column,
        Header: props.translate(column.Header),
      }))}
      {...props}
    />
  );
};

export const RejectedSurveyResponsesView = props => {
  const COLUMNS = getSurveyResponsePageColumns(props.translate);

  return (
    <SurveyResponsesPage
      title={props.translate('admin.rejectedSurveyResponses')}
      baseFilter={{ approval_status: { comparisonValue: 'rejected' } }}
      columns={[...COLUMNS.filter(column => column.type !== 'delete')].map(column => ({
        ...column,
        Header: props.translate(column.Header),
      }))}
      {...props}
    />
  );
};

export const DraftSurveyResponsesView = props => {
  const COLUMNS = getSurveyResponsePageColumns(props.translate);

  const DRAFT_COLUMNS = [
    ...COLUMNS.filter(column => column.type !== 'delete'),
    {
      Header: 'admin.approve',
      source: 'id',
      Cell: ApproveButton,
      filterable: false,
      sortable: false,
      width: 75,
    },
    {
      Header: 'admin.reject',
      source: 'id',
      Cell: RejectButton,
      type: 'delete',
      actionConfig: {
        endpoint: 'surveyResponses',
      },
    },
  ];

  return (
    <SurveyResponsesPage
      {...props}
      title={props.translate('admin.surveyResponsesForReview')}
      baseFilter={{ approval_status: { comparisonValue: 'pending' } }}
      columns={DRAFT_COLUMNS.map(column => ({
        ...column,
        Header: props.translate(column.Header),
      }))}
    />
  );
};

export const NonApprovalSurveyResponsesView = props => {
  const COLUMNS = getSurveyResponsePageColumns(props.translate);

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
  return (
    <SurveyResponsesPage
      {...props}
      title={props.translate('admin.approvalNotRequiredSurveyResponses')}
      baseFilter={{ approval_status: { comparisonValue: 'not_required' } }}
      columns={NON_APPROVAL_COLUMNS.map(column => ({
        ...column,
        Header: props.translate(column.Header),
      }))}
    />
  );
};

ApprovedSurveyResponsesView.propTypes = {
  translate: PropTypes.func.isRequired,
};
DraftSurveyResponsesView.propTypes = {
  translate: PropTypes.func.isRequired,
};
RejectedSurveyResponsesView.propTypes = {
  translate: PropTypes.func.isRequired,
};
NonApprovalSurveyResponsesView.propTypes = {
  translate: PropTypes.func.isRequired,
};
