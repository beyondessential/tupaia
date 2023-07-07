/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dialog, DialogHeader } from '@tupaia/ui-components';
import { closeResubmitSurveyModal } from './actions';
import { Form } from './Form';

export const ResubmitSurveyResponseModalComponent = ({ isOpen, onDismiss, surveyResponseId }) => {
  return (
    <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick maxWidth="xl">
      <DialogHeader onClose={onDismiss} title="Resubmit Survey Response" />
      <Form surveyResponseId={surveyResponseId} onDismiss={() => onDismiss()} />
    </Dialog>
  );
};

ResubmitSurveyResponseModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  surveyResponseId: PropTypes.string,
};

ResubmitSurveyResponseModalComponent.defaultProps = {
  surveyResponseId: undefined,
};

const mapStateToProps = state => ({
  ...state.resubmitSurveyResponse,
});

const mapDispatchToProps = dispatch => ({
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
