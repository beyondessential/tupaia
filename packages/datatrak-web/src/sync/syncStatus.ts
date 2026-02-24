import type { Handler } from 'mitt';
import { useCallback, useEffect, useState } from 'react';

import { useSyncContext } from '../api/SyncContext';
import { SYNC_EVENT_ACTIONS, type SyncEvents } from '../types';

const { SYNC_IN_QUEUE, SYNC_STARTED, SYNC_ENDED } = SYNC_EVENT_ACTIONS;

export function useSyncEventListener<T extends keyof SyncEvents>(
  eventType: T,
  handler: Handler<SyncEvents[T]>,
) {
  const emitter = useSyncContext()?.clientSyncManager?.emitter;
  useEffect(() => {
    emitter?.on<T>(eventType, handler);
    return () => {
      emitter?.off<T>(eventType, handler);
    };
  }, [emitter, eventType, handler]);
}

export function useIsSyncing(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [isSyncing, setIsSyncing] = useState(syncManager?.isSyncing ?? false);

  const update: Handler<undefined> = useCallback(
    () => setIsSyncing(syncManager?.isSyncing ?? false),
    [syncManager?.isSyncing],
  );

  useSyncEventListener(SYNC_IN_QUEUE, update);
  useSyncEventListener(SYNC_STARTED, update);
  useSyncEventListener(SYNC_ENDED, update);

  return isSyncing;
}
