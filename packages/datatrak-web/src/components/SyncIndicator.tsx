import React from 'react';

import { SyncNeutralIcon, SyncSuccessIcon } from './Icons';

interface SyncIndicatorProps {
  syncStatus: 'onlineOnly' | 'availableOffline';
}
export const SyncIndicator = ({ syncStatus }: SyncIndicatorProps) =>
  syncStatus === 'onlineOnly' ? (
    <SyncNeutralIcon titleAccess="Online only" />
  ) : (
    <SyncSuccessIcon titleAccess="Available offline" />
  );
