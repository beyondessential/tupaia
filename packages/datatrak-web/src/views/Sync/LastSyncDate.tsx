import { formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useLastSyncTime } from '../../sync/syncStatus';
import { SyncHeading } from './SyncHeading';
import { SyncParagraph } from './SyncParagraph';

export function formatLastSuccessfulSyncTime(lastSuccessfulSyncTime: Date | null): React.ReactNode {
  const formattedTimeString = lastSuccessfulSyncTime
    ? formatDistance(lastSuccessfulSyncTime, new Date(), { addSuffix: true })
    : '';

  // Capitalize the first letter
  return formattedTimeString.length > 0
    ? formattedTimeString.charAt(0).toUpperCase() + formattedTimeString.slice(1)
    : formattedTimeString;
}

export const LastSyncDate = (props: React.ComponentPropsWithRef<'div'>) => {
  const lastSyncTime = useLastSyncTime();
  const [formattedDate, setFormattedDate] = useState<React.ReactNode>(
    formatLastSuccessfulSyncTime(lastSyncTime),
  );

  useEffect(() => {
    // Refresh relatively formatted date
    const interval = setInterval(
      () => void setFormattedDate(formatLastSuccessfulSyncTime(lastSyncTime)),
      1_000,
    );
    return () => void clearInterval(interval);
  }, [lastSyncTime]);

  return (
    <div {...props}>
      <SyncHeading>Last successful sync</SyncHeading>
      <SyncParagraph>
        {lastSyncTime ? (
          <time dateTime={lastSyncTime.toISOString()}>{formattedDate}</time>
        ) : (
          'Never'
        )}
      </SyncParagraph>
    </div>
  );
};
