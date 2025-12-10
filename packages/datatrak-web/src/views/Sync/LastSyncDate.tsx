import { formatDistance } from 'date-fns';
import React, { HTMLAttributes } from 'react';
import { SyncHeading } from './SyncHeading';
import { SyncParagraph } from './SyncParagraph';

interface LastSyncDateProps extends HTMLAttributes<HTMLDivElement> {
  lastSyncDate: Date | null;
}

export function formatLastSuccessfulSyncTime(lastSuccessfulSyncTime: Date | null): string {
  const formattedTimeString = lastSuccessfulSyncTime
    ? formatDistance(lastSuccessfulSyncTime, new Date(), { addSuffix: true })
    : '';

  // Capitalize the first letter
  return formattedTimeString.length > 0
    ? formattedTimeString.charAt(0).toUpperCase() + formattedTimeString.slice(1)
    : formattedTimeString;
}

export const LastSyncDate = ({ lastSyncDate, ...props }: LastSyncDateProps) => {
  return (
    <div {...props}>
      <SyncHeading>Last successful sync</SyncHeading>
      <SyncParagraph>
        <time dateTime={lastSyncDate?.toISOString()}>
          {formatLastSuccessfulSyncTime(lastSyncDate)}
        </time>
      </SyncParagraph>
    </div>
  );
};
