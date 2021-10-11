/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import {
  SurveyResponsesPage as ResourcePage,
  SURVEY_RESPONSE_COLUMNS,
} from '@tupaia/admin-panel/lib';
import { ConfirmModal } from '@tupaia/ui-components';
import { ApproveButton } from '../components';

// Todo: Replace base filter with real filter @see WAI-832
export const ApprovedSurveyResponsesView = props => (
  <ResourcePage
    title="Approved Survey Responses"
    baseFilter={{ 'survey.code': { comparator: 'ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
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
    type: 'delete',
    actionConfig: {
      endpoint: 'surveyResponses',
    },
  },
];

// eslint-disable-next-line react/prop-types
const ConfirmRejectModal = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <ConfirmModal
      onClose={onCancel}
      isOpen={isOpen}
      handleAction={onConfirm}
      isLoading={false}
      title="Reject Survey Response"
      mainText="Are you sure you want to reject this Survey Response?"
      description="Rejecting a Survey Response will also delete it. Once deleted this can’t be undone."
      actionText="Yes, Reject and Delete"
      loadingText="Saving"
    />
  );
};

// Todo: Replace base filter with real filter @see WAI-832
export const DraftSurveyResponsesView = props => (
  <ResourcePage
    {...props}
    title="Survey Responses For Review"
    baseFilter={{ 'survey.code': { comparator: 'NOT ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
    columns={COLUMNS}
    ConfirmDeleteModalComponent={ConfirmRejectModal}
  />
);
