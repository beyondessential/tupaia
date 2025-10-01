import React, { HTMLAttributes } from 'react';
import { SyncHeading } from './SyncHeading';
import { SyncParagraph } from './SyncParagraph';
interface LastSyncDateProps extends HTMLAttributes<HTMLDivElement> {
  formattedLastSuccessfulSyncTime: React.ReactNode;
  lastSyncDate: Date | null;
}

export const LastSyncDate = ({
  formattedLastSuccessfulSyncTime,
  lastSyncDate,
  ...props
}: LastSyncDateProps) => {
  return (
    <div {...props}>
      <SyncHeading>Last successful sync</SyncHeading>
      <SyncParagraph>
        <time dateTime={lastSyncDate?.toISOString()}>{formattedLastSuccessfulSyncTime}</time>
      </SyncParagraph>
    </div>
  );
};
