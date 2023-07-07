/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { IconButton } from '../../widgets';
import { openResubmitSurveyResponseModal } from '../../surveyResponse/actions';

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ResubmitSurveyResponseButtonComponent = ({ openModal }) => {
  return (
    <ButtonContainer>
      <IconButton onClick={openModal} />
    </ButtonContainer>
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
