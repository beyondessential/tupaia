import { surveysTabRoutes } from '@tupaia/admin-panel';
import { getSurveyResponsePageConfig } from './getSurveyResponsePageConfig';
import { ApproveButton, getRejectButton } from '../../components';

const approvedSurveyResponses = (translate, adminUrl) => {
  const path = '/approved';
  const { columns: COLUMNS, ...configs } = getSurveyResponsePageConfig(translate, path, adminUrl);

  return {
    ...configs,
    reduxId: 'approvedSurveyResponses', // This is used to store the data in the redux store
    label: translate('admin.approved'),
    path,
    baseFilter: { approval_status: { comparisonValue: 'approved' } },
    columns: COLUMNS.filter(column => column.type !== 'delete'),
  };
};

const rejectedSurveyResponses = (translate, adminUrl) => {
  const path = '/rejected';
  const { columns: COLUMNS, ...configs } = getSurveyResponsePageConfig(translate, path, adminUrl);

  return {
    ...configs,
    reduxId: 'rejectedSurveyResponses', // This is used to store the data in the redux store
    label: translate('admin.rejected'),
    path,
    baseFilter: { approval_status: { comparisonValue: 'rejected' } },
    columns: COLUMNS.filter(column => column.type !== 'delete'),
  };
};

const draftSurveyResponses = (translate, adminUrl) => {
  const path = '';
  const { columns: COLUMNS, ...configs } = getSurveyResponsePageConfig(translate, path, adminUrl);

  const DRAFT_COLUMNS = [
    ...COLUMNS.filter(column => column.type !== 'delete'),
    {
      Header: translate('admin.approve'),
      Cell: ApproveButton,
      filterable: false,
      disableSortBy: true,
      isButtonColumn: true,
    },
    {
      Header: translate('admin.reject'),
      Cell: getRejectButton(translate),
      type: 'delete',
      isButtonColumn: true,
      actionConfig: {
        endpoint: 'surveyResponses',
      },
    },
  ];

  return {
    ...configs,
    reduxId: 'pendingSurveyResponses', // This is used to store the data in the redux store
    label: translate('admin.review'),
    path,
    default: true,
    baseFilter: { approval_status: { comparisonValue: 'pending' } },
    columns: DRAFT_COLUMNS,
  };
};

const nonApprovalSurveyResponses = (translate, adminUrl) => {
  const path = '/non-approval';
  const { columns: COLUMNS, ...configs } = getSurveyResponsePageConfig(translate, path, adminUrl);
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
  return {
    ...configs,
    path,
    label: translate('admin.approvalNotRequired'),
    baseFilter: { approval_status: { comparisonValue: 'not_required' } },
    columns: NON_APPROVAL_COLUMNS,
  };
};

export const getSurveyResponsesTabRoutes = (translate, adminUrl) => ({
  label: translate('admin.surveyData'),
  path: '/survey-responses',
  icon: surveysTabRoutes.icon,
  childViews: [
    draftSurveyResponses(translate, adminUrl),
    approvedSurveyResponses(translate, adminUrl),
    rejectedSurveyResponses(translate, adminUrl),
    nonApprovalSurveyResponses(translate, adminUrl),
  ],
});
