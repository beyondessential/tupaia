import { useCallback, useEffect, useState } from 'react';

import { useSyncContext } from '../api/SyncContext';
import { SYNC_EVENT_ACTIONS } from '../types';

export function useIsSyncing(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [isSyncing, setIsSyncing] = useState(syncManager?.isSyncing ?? false);

  const update = useCallback(
    () => void setIsSyncing(syncManager?.isSyncing ?? false),
    [syncManager?.isSyncing],
  );

  useEffect(() => {
    syncManager?.emitter.on(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE, update);
    syncManager?.emitter.on(SYNC_EVENT_ACTIONS.SYNC_STARTED, update);
    syncManager?.emitter.on(SYNC_EVENT_ACTIONS.SYNC_ENDED, update);

    return () => {
      syncManager?.emitter.off(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE, update);
      syncManager?.emitter.off(SYNC_EVENT_ACTIONS.SYNC_STARTED, update);
      syncManager?.emitter.off(SYNC_EVENT_ACTIONS.SYNC_ENDED, update);
    };
  }, [syncManager?.emitter, update]);

  return isSyncing;
}
