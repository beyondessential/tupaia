import React, { useCallback, useState } from 'react';

import { useSyncContext } from '../api';
import { useSyncEventListener } from '../sync/syncStatus';
import { SYNC_EVENT_ACTIONS } from '../types';
import { BannerNotification } from './BannerNotification';

export const DataUpdateDeferredNotification = () => {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [deferred, setDeferred] = useState(syncManager?.dataResetDeferred ?? false);

  const update = useCallback(
    () => setDeferred(syncManager?.dataResetDeferred ?? false),
    [syncManager?.dataResetDeferred],
  );

  useSyncEventListener(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED, update);

  if (!deferred) {
    return null;
  }

  return (
    <BannerNotification>
      <strong>Data update pending.</strong> DataTrak needs to update its data, but some of your
      changes haven’t reached the server yet. Please connect to the internet; this will retry
      automatically.
    </BannerNotification>
  );
};
