import React from 'react';
import styled from 'styled-components';
import MuiInfoIcon from '@material-ui/icons/InfoOutlined';
import { Typography } from '@material-ui/core';

const InfoIcon = styled(MuiInfoIcon)`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.palette.primary.main};
  width: 1.5rem;
  height: 1.5rem;
`;

const OfflineErrorMessageContainer = styled.div`
  padding-inline: 1.5rem;
  font-size: 0.875rem;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;

  .MuiTypography-h2 {
    font-size: 0.9rem;
  }
  .MuiTypography-body1 {
    font-size: 0.9rem;
  }
`;

const OfflineTitle = styled(Typography).attrs({
  variant: 'h1',
})`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const OfflineMessage = styled(Typography).attrs({
  variant: 'body1',
})`
  font-size: 0.875rem;
`;

interface OfflineErrorMessageProps {
  offlineMessage: string;
}

export const OfflineErrorMessage = ({ offlineMessage }: OfflineErrorMessageProps) => (
  <OfflineErrorMessageContainer>
    <InfoIcon />
    <OfflineTitle>You are currently offline</OfflineTitle>
    <OfflineMessage>{offlineMessage}</OfflineMessage>
  </OfflineErrorMessageContainer>
);
