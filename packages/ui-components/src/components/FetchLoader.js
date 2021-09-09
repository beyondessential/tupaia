/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SmallAlert } from './Alert';
import { ErrorBoundary } from './ErrorBoundary';
import { FlexCenter } from './Layout';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

const SpinningLoader = () => (
  <Container>
    <CircularProgress size={50} />
  </Container>
);

export const FetchLoader = ({
  isLoading,
  isError,
  isNoData,
  error,
  noDataMessage,
  children,
  Loader,
}) => {
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Container>
        <SmallAlert severity="error" variant="standard">
          {error.message}
        </SmallAlert>
      </Container>
    );
  }

  if (isNoData) {
    return (
      <Container>
        <SmallAlert severity="info" variant="standard">
          {noDataMessage}
        </SmallAlert>
      </Container>
    );
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

FetchLoader.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  isNoData: PropTypes.bool,
  error: PropTypes.object,
  noDataMessage: PropTypes.string,
  Loader: PropTypes.func,
};

FetchLoader.defaultProps = {
  isLoading: false,
  isError: false,
  isNoData: false,
  children: null,
  error: null,
  noDataMessage: null,
  Loader: SpinningLoader,
};
