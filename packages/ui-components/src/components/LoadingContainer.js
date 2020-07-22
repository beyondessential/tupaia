/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

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

/**
 * Adds a loader around the children
 */
export const LoadingContainer = ({ isLoading, heading, text, children }) => {
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
};

LoadingContainer.defaultProps = {
  heading: 'Saving Data',
  text: 'Please do not refresh browser or close this page',
};
