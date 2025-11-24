import { Typography } from '@material-ui/core';
import MuiInfoIcon from '@material-ui/icons/InfoOutlined';
import React from 'react';
import styled from 'styled-components';

const InfoIcon = styled(MuiInfoIcon)`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.palette.primary.main};
  width: 1.5rem;
  height: 1.5rem;
`;

const OfflineErrorMessageContainer = styled.article`
  align-items: center;
  font-size: 0.875rem;
  margin-block-end: 2rem;
  padding-inline: 1.5rem;
  text-align: center;
  text-wrap: balance;

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
  line-height: 1.5;
`;

interface OfflineErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  offlineMessage: string;
}

export const OfflineErrorMessage = ({ offlineMessage, ...props }: OfflineErrorMessageProps) => (
  <OfflineErrorMessageContainer {...props}>
    <InfoIcon />
    <OfflineTitle>You are currently offline</OfflineTitle>
    <OfflineMessage>{offlineMessage}</OfflineMessage>
  </OfflineErrorMessageContainer>
);
