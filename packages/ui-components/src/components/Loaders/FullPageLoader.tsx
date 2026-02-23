import { Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import styled from 'styled-components';
import { FlexCenter } from '../Layout';

const LoadingContainer = styled(FlexCenter)`
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  padding-bottom: 2.5%;
  gap: 4rem;
`;

export const FullPageLoader = ({ message }: { message?: Readonly<React.ReactNode> }) => (
  <LoadingContainer>
    <CircularProgress size={100} />
    {message && (
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
    )}
  </LoadingContainer>
);
