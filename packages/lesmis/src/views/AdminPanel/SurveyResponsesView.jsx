/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PropTypes } from 'prop-types';
import { ResourcePage } from '@tupaia/admin-panel';
import { ApproveButton, getRejectButton } from './components';
import { getSurveyResponsePageConfigs } from './pages/helpers/getSurveyResponsePageConfigs';
import { useI18n } from '../../utils';

export const ApprovedSurveyResponsesView = props => {
  const {
    columns: COLUMNS,
    importConfig,
    exportConfig,
    editorConfig,
    ExportModalComponent,
  } = getSurveyResponsePageConfigs(props);

  return (
    <ResourcePage
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
    <ResourcePage
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

export const draftSurveyResponses = translate => {
  const { columns: COLUMNS, ...configs } = getSurveyResponsePageConfigs({ translate });

  const DRAFT_COLUMNS = [
    ...COLUMNS.filter(column => column.type !== 'delete'),
    {
      Header: translate('admin.approve'),
      Cell: ApproveButton,
      filterable: false,
      disableSortBy: true,
      width: 75,
    },
    {
      Header: translate('admin.reject'),
      Cell: getRejectButton(translate),
      type: 'delete',
      actionConfig: {
        endpoint: 'surveyResponses',
      },
    },
  ];

  return {
    ...configs,
    title: translate('admin.review'),
    url: '',
    exact: true,
    default: true,
    baseFilter: { approval_status: { comparisonValue: 'pending' } },
    columns: DRAFT_COLUMNS,
  };
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
    <ResourcePage
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

RejectedSurveyResponsesView.propTypes = {
  translate: PropTypes.func.isRequired,
};
NonApprovalSurveyResponsesView.propTypes = {
  translate: PropTypes.func.isRequired,
};
