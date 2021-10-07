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
import { ConfirmModal } from '@tupaia/ui-components';
import { MODAL_STATUS } from '@tupaia/admin-panel/src/VizBuilderApp/constants';

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

export const DraftSurveyResponsesView = props => (
  <ResourcePage
    {...props}
    title="Survey Responses (Review)"
    baseFilter={{ 'survey.code': { comparator: 'NOT ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
    columns={COLUMNS}
    ConfirmDeleteModalComponent={ConfirmRejectModal}
  />
);
