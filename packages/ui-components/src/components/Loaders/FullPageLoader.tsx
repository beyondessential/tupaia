import { Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import styled from 'styled-components';
import { FlexCenter } from '../Layout';

const LoadingContainer = styled(FlexCenter)`
  flex-direction: column;
  gap: 4rem;
  height: 100vh;
  height: 100dvh;
  padding-bottom: 2.5%;
  text-wrap: balance;
`;

const progress = <CircularProgress size={100} />;

export const FullPageLoader = ({ message }: { message?: Readonly<React.ReactNode> }) => (
  <LoadingContainer>
    {progress}
    {message && (
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
    )}
  </LoadingContainer>
);
