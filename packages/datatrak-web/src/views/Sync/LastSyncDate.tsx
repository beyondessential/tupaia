import { Typography } from '@material-ui/core';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

const Heading = styled(Typography).attrs({ variant: 'h2' })`
  font-size: inherit;
  letter-spacing: initial;
`;

const Paragraph = styled.p`
  margin-block: 0;
`;

interface LastSyncDateProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
}

export const LastSyncDate = ({ message, ...props }: LastSyncDateProps) => {
  return (
    <div {...props}>
      <Heading>Last successful sync</Heading>
      <Paragraph>{message === null ? 'Never' : message}</Paragraph>
    </div>
  );
};
