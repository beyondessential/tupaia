/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import { openResubmitSurveyResponseModal } from '../../surveyResponse/actions';
import { ColumnActionButton } from './ColumnActionButton';

export const ResubmitSurveyResponseButtonComponent = ({ openModal, row }) => {
  if (row.original.outdated) return null;
  return (
    <ColumnActionButton onClick={openModal}>
      <EditIcon />
    </ColumnActionButton>
  );
};

ResubmitSurveyResponseButtonComponent.propTypes = {
  openModal: PropTypes.func.isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      outdated: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    openModal: () => {
      const recordId = ownProps.row.original.id;
      dispatch(openResubmitSurveyResponseModal(recordId));
    },
  };
};

export const ResubmitSurveyResponseButton = connect(
  null,
  mapDispatchToProps,
)(ResubmitSurveyResponseButtonComponent);
