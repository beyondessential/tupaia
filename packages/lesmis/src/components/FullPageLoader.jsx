import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding-bottom: 10%;
`;

export const FullPageLoader = () => (
  <LoadingContainer>
    <CircularProgress size={100} />
  </LoadingContainer>
);
