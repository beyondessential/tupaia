/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { IconButton } from '../../widgets';
import { openResubmitSurveyResponseModal } from '../../surveyResponse/actions';

export const ResubmitSurveyResponseButtonComponent = ({ openModal }) => {
  return (
    <IconButton onClick={openModal}>
      <EditIcon />
    </IconButton>
  );
};

ResubmitSurveyResponseButtonComponent.propTypes = {
  openModal: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  openModal: () => {
    const recordId = ownProps.value;
    dispatch(openResubmitSurveyResponseModal(recordId));
  },
});

export const ResubmitSurveyResponseButton = connect(
  null,
  mapDispatchToProps,
)(ResubmitSurveyResponseButtonComponent);
