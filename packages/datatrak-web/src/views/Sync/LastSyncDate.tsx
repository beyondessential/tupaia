import { Typography } from '@material-ui/core';
import { formatRelative } from 'date-fns';
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
  date: Date | null;
}

export const LastSyncDate = ({ date, ...props }: LastSyncDateProps) => (
  <div {...props}>
    <Heading>Last successful sync</Heading>
    <Paragraph>
      {date === null ? (
        'Never'
      ) : (
        <time dateTime={date.toISOString()} title={date.toLocaleString()}>
          {formatRelative(date, new Date(), { weekStartsOn: 1 })}
        </time>
      )}
    </Paragraph>
  </div>
);
