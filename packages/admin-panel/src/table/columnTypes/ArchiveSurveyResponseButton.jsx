import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openArchiveSurveyResponseModal } from '../../surveyResponse/actions';
import { ColumnActionButton } from './ColumnActionButton';
import { ArchiveIcon } from '../../icons';

export const ArchiveSurveyResponseButtonComponent = ({ openModal, row }) => {
  if (row.original.outdated) return null;
  return (
    <ColumnActionButton onClick={openModal} title="Archive">
      <ArchiveIcon />
    </ColumnActionButton>
  );
};

ArchiveSurveyResponseButtonComponent.propTypes = {
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
      dispatch(openArchiveSurveyResponseModal(recordId));
    },
  };
};

export const ArchiveSurveyResponseButton = connect(
  null,
  mapDispatchToProps,
)(ArchiveSurveyResponseButtonComponent);
