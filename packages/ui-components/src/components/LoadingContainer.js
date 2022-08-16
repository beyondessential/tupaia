/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { SmallAlert } from './Alert';
import { GreyOutlinedButton } from './Button';

const Container = styled.div`
  position: relative;
`;

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  z-index: 10;
`;

const Loader = styled(CircularProgress)`
  margin-bottom: 1rem;
`;

const LoadingHeading = styled(Typography)`
  margin-bottom: 0.5rem;
`;

const LoadingText = styled(Typography)`
  margin-bottom: 0.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const ErrorText = styled(Typography)`
  margin-bottom: 1rem;
`;

const ErrorAlert = styled(SmallAlert)`
  position: absolute;
  top: 30%;
  width: 90%;
  font-weight: 500;
  border: 1px solid rgba(209, 51, 51, 0.2);
  justify-content: center;
`;

const ErrorScreen = ({ onReset, errorMessage }) => {
  return (
    <>
      <ErrorText>{errorMessage}</ErrorText>
      <GreyOutlinedButton onClick={onReset}>Start over</GreyOutlinedButton>
    </>
  );
};

ErrorScreen.propTypes = {
  onReset: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

/**
 * Adds a loader around the children
 */
export const LoadingContainer = ({ isLoading, heading, text, children, errorMessage, onReset }) => {
  if (onReset && errorMessage) {
    return (
      <Container>
        {children}
        <LoadingScreen>
          <ErrorScreen onReset={onReset} errorMessage={errorMessage} />
        </LoadingScreen>
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container>
        {children}
        <LoadingScreen>
          <ErrorAlert severity="error" variant="standard">
            {errorMessage}
          </ErrorAlert>
        </LoadingScreen>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        {children}
        <LoadingScreen>
          <Loader />
          <LoadingHeading variant="h5">{heading}</LoadingHeading>
          <LoadingText variant="body2">{text}</LoadingText>
        </LoadingScreen>
      </Container>
    );
  }

  return children;
};

LoadingContainer.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.any.isRequired,
  heading: PropTypes.string,
  text: PropTypes.string,
  onReset: PropTypes.func,
};

LoadingContainer.defaultProps = {
  heading: 'Saving Data',
  text: 'Please do not refresh the browser or close this page',
  onReset: null,
};
