import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlexCenter } from '../Layout';

const LoadingContainer = styled(FlexCenter)`
  height: 100vh;
  padding-bottom: 10%;
`;

export const FullPageLoader = () => (
  <LoadingContainer>
    <CircularProgress size={100} />
  </LoadingContainer>
);
