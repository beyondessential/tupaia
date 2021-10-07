/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import {
  IconButton,
  SurveyResponsesPage as ResourcePage,
  SURVEY_RESPONSE_COLUMNS,
} from '@tupaia/admin-panel/lib';
import MuiSnackbar from '@material-ui/core/Snackbar';
import CheckIcon from '@material-ui/icons/Check';
import { ConfirmModal, SmallAlert } from '@tupaia/ui-components';
import { useApproveSurveyResponse } from '../api/mutations/useApproveSurveyResponse';

export const ApprovedSurveyResponsesView = props => (
  <ResourcePage
    title="Survey Responses (Approved)"
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

// eslint-disable-next-line no-unused-vars
const ApproveButton = ({ dispatch, value: id, actionConfig, reduxId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isLoading, isError, isSuccess } = useApproveSurveyResponse();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClickAccept = async () => {
    console.log('click accept', id);

    mutate(
      {
        surveyResponseId: id,
      },
      {
        onSuccess: () => {
          setIsOpen(true);
        },
        onError: () => {
          setIsOpen(true);
        },
      },
    );
  };

  return (
    <>
      <IconButton onClick={handleClickAccept}>
        <CheckIcon />
      </IconButton>
      <MuiSnackbar
        open={isOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <>
          {isSuccess && (
            <SmallAlert onClose={handleClose} severity="success">
              Success
            </SmallAlert>
          )}
          {isError && (
            <SmallAlert onClose={handleClose} severity="error">
              Error. Please click refresh and try again.
            </SmallAlert>
          )}
        </>
      </MuiSnackbar>
    </>
  );
};

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

export const DraftSurveyResponsesView = props => (
  <ResourcePage
    {...props}
    title="Survey Responses (Review)"
    baseFilter={{ 'survey.code': { comparator: 'NOT ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
    columns={COLUMNS}
    ConfirmDeleteModalComponent={ConfirmRejectModal}
  />
);
