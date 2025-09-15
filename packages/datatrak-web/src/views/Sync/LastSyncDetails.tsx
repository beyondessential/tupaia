import React, { HTMLAttributes } from 'react';

import { SyncParagraph } from './SyncParagraph';

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
    <SyncParagraph>
      {`pulled ${lastSyncPulledRecordsCount} change(s), pushed ${lastSyncPushedRecordsCount} change(s)`}
    </SyncParagraph>
  );
};
