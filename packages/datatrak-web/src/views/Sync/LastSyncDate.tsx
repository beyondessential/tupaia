import React, { HTMLAttributes } from 'react';
import { SyncHeading } from './SyncHeading';
import { SyncParagraph } from './SyncParagraph';
interface LastSyncDateProps extends HTMLAttributes<HTMLDivElement> {
  message: React.ReactNode;
}

export const LastSyncDate = ({ message, ...props }: LastSyncDateProps) => {
  return (
    <div {...props}>
      <SyncHeading>Last successful sync</SyncHeading>
      <SyncParagraph>{message === null ? 'Never' : message}</SyncParagraph>
    </div>
  );
};
