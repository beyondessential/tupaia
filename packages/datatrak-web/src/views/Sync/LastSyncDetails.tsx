import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

const Paragraph = styled.p`
  margin-block: 0;
`;

interface LastSyncDetailsProps extends HTMLAttributes<HTMLDivElement> {
  lastSyncPulledRecordsCount: number | null;
  lastSyncPushedRecordsCount: number | null;
}

export const LastSyncDetails = ({
  lastSyncPulledRecordsCount,
  lastSyncPushedRecordsCount,
}: LastSyncDetailsProps) => {
  if (lastSyncPulledRecordsCount === null || lastSyncPushedRecordsCount === null) {
    return null;
  }
  return (
    <Paragraph>
      {`pulled ${lastSyncPulledRecordsCount} change(s), pushed ${lastSyncPushedRecordsCount} change(s)`}
    </Paragraph>
  );
};
