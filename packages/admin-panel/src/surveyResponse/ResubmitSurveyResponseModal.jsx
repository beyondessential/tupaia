/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dialog, ModalHeader } from '@tupaia/ui-components';
import { closeResubmitSurveyModal, onAfterMutate as onAfterMutateAction } from './actions';
import { Form } from './Form';

export const ResubmitSurveyResponseModalComponent = ({
  isOpen,
  onDismiss,
  surveyResponseId,
  onAfterMutate,
}) => {
  return (
    <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick maxWidth="sm">
      <ModalHeader onClose={onDismiss} title="Resubmit survey response" />
      <Form
        surveyResponseId={surveyResponseId}
        onDismiss={() => onDismiss()}
        onAfterMutate={onAfterMutate}
      />
    </Dialog>
  );
};

ResubmitSurveyResponseModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  surveyResponseId: PropTypes.string,
  onAfterMutate: PropTypes.func.isRequired,
};

ResubmitSurveyResponseModalComponent.defaultProps = {
  surveyResponseId: undefined,
};

const mapStateToProps = state => ({
  ...state.surveyResponse,
  isOpen: state.surveyResponse.isResubmitModalOpen,
});

const mapDispatchToProps = dispatch => ({
  onAfterMutate: () => dispatch(onAfterMutateAction()),
  onDismiss: () => dispatch(closeResubmitSurveyModal()),
});

const mergeProps = ({ ...stateProps }, { dispatch, ...dispatchProps }, { ...ownProps }) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  };
};

export const ResubmitSurveyResponseModal = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(ResubmitSurveyResponseModalComponent);
