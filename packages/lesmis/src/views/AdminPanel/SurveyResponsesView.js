/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PropTypes } from 'prop-types';

import { SurveyResponsesPage } from '@tupaia/admin-panel';
import { ApproveButton, getRejectButton } from '../../components';
import { getSurveyResponsePageConfigs } from './pages/helpers/getSurveyResponsePageConfigs';

export const ApprovedSurveyResponsesView = props => {
  const {
    columns: COLUMNS,
    importConfig,
    exportConfig,
    editorConfig,
    ExportModalComponent,
  } = getSurveyResponsePageConfigs(props);

  return (
    <SurveyResponsesPage
      title={props.translate('admin.approvedSurveyResponses')}
      baseFilter={{ approval_status: { comparisonValue: 'approved' } }}
      columns={COLUMNS.filter(column => column.type !== 'delete')}
      importConfig={importConfig}
      exportConfig={exportConfig}
      editorConfig={editorConfig}
      ExportModalComponent={ExportModalComponent}
      {...props}
    />
  );
};

export const RejectedSurveyResponsesView = props => {
  const {
    columns: COLUMNS,
    importConfig,
    exportConfig,
    editorConfig,
    ExportModalComponent,
  } = getSurveyResponsePageConfigs(props);

  return (
    <SurveyResponsesPage
      title={props.translate('admin.rejectedSurveyResponses')}
      baseFilter={{ approval_status: { comparisonValue: 'rejected' } }}
      columns={COLUMNS.filter(column => column.type !== 'delete')}
      importConfig={importConfig}
      exportConfig={exportConfig}
      editorConfig={editorConfig}
      ExportModalComponent={ExportModalComponent}
      {...props}
    />
  );
};

export const DraftSurveyResponsesView = props => {
  const {
    columns: COLUMNS,
    importConfig,
    exportConfig,
    editorConfig,
    ExportModalComponent,
  } = getSurveyResponsePageConfigs(props);

  const DRAFT_COLUMNS = [
    ...COLUMNS.filter(column => column.type !== 'delete'),
    {
      Header: props.translate('admin.approve'),
      source: 'id',
      Cell: ApproveButton,
      filterable: false,
      sortable: false,
      width: 75,
    },
    {
      Header: props.translate('admin.reject'),
      source: 'id',
      Cell: getRejectButton(props.translate),
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
      columns={DRAFT_COLUMNS}
      importConfig={importConfig}
      exportConfig={exportConfig}
      editorConfig={editorConfig}
      ExportModalComponent={ExportModalComponent}
    />
  );
};

export const NonApprovalSurveyResponsesView = props => {
  const {
    columns: COLUMNS,
    importConfig,
    exportConfig,
    editorConfig,
    ExportModalComponent,
  } = getSurveyResponsePageConfigs(props);

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
      columns={NON_APPROVAL_COLUMNS}
      importConfig={importConfig}
      exportConfig={exportConfig}
      editorConfig={editorConfig}
      ExportModalComponent={ExportModalComponent}
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
