/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SmallAlert } from '@tupaia/ui-components';
import { ErrorBoundary } from './ErrorBoundary';
import { FlexCenter } from './Layout';

const SpinningLoader = () => (
  <FlexCenter>
    <CircularProgress size={50} />
  </FlexCenter>
);

export const FetchLoader = ({ isLoading, isError, error, children, Loader }) => {
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <FlexCenter>
        <SmallAlert severity="error" variant="standard">
          {error.message}
        </SmallAlert>
      </FlexCenter>
    );
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

FetchLoader.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.object,
  Loader: PropTypes.func,
};

FetchLoader.defaultProps = {
  isLoading: false,
  isError: false,
  children: null,
  error: null,
  Loader: SpinningLoader,
};
