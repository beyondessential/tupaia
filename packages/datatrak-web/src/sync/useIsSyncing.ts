import { useCallback, useEffect, useState } from 'react';

import { useSyncContext } from '../api/SyncContext';
import { SYNC_EVENT_ACTIONS } from '../types';

export function useIsSyncing(): boolean {
  const [isSyncing, setIsSyncing] = useState(false);
  const emitter = useSyncContext()?.clientSyncManager?.emitter;

  const set = useCallback(() => setIsSyncing(true), []);
  const unset = useCallback(() => setIsSyncing(false), []);

  useEffect(() => {
    if (emitter === undefined) return;

    emitter.on(SYNC_EVENT_ACTIONS.SYNC_STARTED, set);
    emitter.on(SYNC_EVENT_ACTIONS.SYNC_ENDED, unset);

    return () => {
      emitter.off(SYNC_EVENT_ACTIONS.SYNC_STARTED, set);
      emitter.off(SYNC_EVENT_ACTIONS.SYNC_ENDED, unset);
    };
  }, [emitter, set, unset]);

  return isSyncing;
}
