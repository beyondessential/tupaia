import React, { ElementType, ReactNode } from 'react';
import styled from 'styled-components';
import { SmallAlert } from './Alert';
import { ErrorBoundary } from './ErrorBoundary';
import { FlexCenter } from './Layout';
import { SpinningLoader } from './Loaders';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

interface FetchLoaderProps {
  isLoading?: boolean;
  isError?: boolean;
  isNoData?: boolean;
  error?: any;
  noDataMessage?: string;
  Loader?: ElementType;
  children?: ReactNode;
}

export const FetchLoader = ({
  isLoading = false,
  isError = false,
  isNoData = false,
  error = null,
  noDataMessage,
  children = null,
  Loader = SpinningLoader,
}: FetchLoaderProps) => {
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
