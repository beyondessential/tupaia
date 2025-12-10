import { formatDistance } from 'date-fns';
import React, { HTMLAttributes, useEffect, useState } from 'react';
import { SyncHeading } from './SyncHeading';
import { SyncParagraph } from './SyncParagraph';

interface LastSyncDateProps extends HTMLAttributes<HTMLDivElement> {
  lastSyncDate: Date | null;
}

export function formatLastSuccessfulSyncTime(lastSuccessfulSyncTime: Date | null): React.ReactNode {
  const formattedTimeString = lastSuccessfulSyncTime
    ? formatDistance(lastSuccessfulSyncTime, new Date(), { addSuffix: true })
    : '';

  // Capitalize the first letter
  return formattedTimeString.length > 0
    ? formattedTimeString.charAt(0).toUpperCase() + formattedTimeString.slice(1)
    : formattedTimeString;
}

export const LastSyncDate = ({ lastSyncDate, ...props }: LastSyncDateProps) => {
  const [formattedDate, setFormattedDate] = useState<React.ReactNode>();

  useEffect(() => {
    // Refresh relatively formatted date
    const interval = setInterval(
      () => void setFormattedDate(formatLastSuccessfulSyncTime(lastSyncDate)),
      1_000,
    );
    return () => void clearInterval(interval);
  }, [lastSyncDate]);

  return (
    <div {...props}>
      <SyncHeading>Last successful sync</SyncHeading>
      <SyncParagraph>
        <time dateTime={lastSyncDate?.toISOString()}>{formattedDate}</time>
      </SyncParagraph>
    </div>
  );
};
