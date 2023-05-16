/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { FC, ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SmallAlert } from './Alert';
import { ErrorBoundary } from './ErrorBoundary';
import { FlexCenter } from './Layout';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

const SpinningLoader: FC = (): ReactElement => (
  <Container>
    <CircularProgress size={50} />
  </Container>
);

export const FetchLoader: FC<{
  isLoading?: boolean;
  isError?: boolean;
  isNoData?: boolean;
  error?: any;
  noDataMessage?: string;
  Loader?: FC;
  children?: ReactNode;
}> = ({
  isLoading = false,
  isError = false,
  isNoData = false,
  error = null,
  noDataMessage = null,
  children = null,
  Loader = SpinningLoader,
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
