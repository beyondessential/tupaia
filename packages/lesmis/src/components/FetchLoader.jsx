import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SmallAlert } from '@tupaia/ui-components';
import { ErrorBoundary } from './ErrorBoundary';
import { FlexCenter } from './Layout';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
  margin: auto;
`;

const SpinningLoader = () => (
  <Container>
    <CircularProgress size={50} />
  </Container>
);

export const FetchLoader = ({ isLoading, isError, error, children, Loader }) => {
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
