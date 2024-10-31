/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, ModalCenteredContent, SpinningLoader } from '@tupaia/ui-components';
import { closeArchiveSurveyResponseModal, onAfterMutate as onAfterMutateAction } from './actions';
import { useEditSurveyResponse } from '../api/mutations/useEditSurveyResponse';
import { Typography } from '@material-ui/core';

export const ArchiveSurveyResponseModalComponent = ({
  isOpen,
  onDismiss,
  surveyResponseId,
  onAfterMutate,
}) => {
  const onSuccessfulArchive = () => {
    onAfterMutate();
    onDismiss();
  };
  const {
    mutateAsync: editResponse,
    isLoading,
    isError,
    error: editError,
    reset, // reset the mutation state so we can dismiss the error
  } = useEditSurveyResponse(
    surveyResponseId,
    {
      outdated: true,
    },
    onSuccessfulArchive,
  );

  const getButtons = () => {
    if (isError) {
      return [
        {
          text: 'Close',
          variant: 'contained',
          onClick: reset,
        },
      ];
    }
    return [
      {
        text: 'Cancel',
        onClick: onDismiss,
        variant: 'outlined',
        disabled: isLoading,
      },
      {
        text: 'Submit',
        onClick: editResponse,
        disabled: isLoading,
      },
    ];
  };

  const buttons = getButtons();
  return (
    <Modal
      onClose={onDismiss}
      isOpen={isOpen}
      title="Archive survey response"
      buttons={buttons}
      error={editError}
    >
      <ModalCenteredContent>
        {isLoading ? (
          <SpinningLoader />
        ) : (
          <Typography>
            Are you sure you would like to archive this survey response? This cannot be undone.
          </Typography>
        )}
      </ModalCenteredContent>
    </Modal>
  );
};

ArchiveSurveyResponseModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  surveyResponseId: PropTypes.string,
  onAfterMutate: PropTypes.func.isRequired,
};

ArchiveSurveyResponseModalComponent.defaultProps = {
  surveyResponseId: undefined,
};

const mapStateToProps = state => ({
  ...state.surveyResponse,
  isOpen: state.surveyResponse.isArchiveModalOpen,
});

const mapDispatchToProps = dispatch => ({
  onAfterMutate: () => dispatch(onAfterMutateAction()),
  onDismiss: () => dispatch(closeArchiveSurveyResponseModal()),
});

export const ArchiveSurveyResponseModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ArchiveSurveyResponseModalComponent);
