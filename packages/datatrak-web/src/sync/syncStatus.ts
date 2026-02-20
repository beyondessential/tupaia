import type { Handler } from 'mitt';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSyncContext } from '../api/SyncContext';
import { SYNC_EVENT_ACTIONS, type SyncEvents } from '../types';

const { SYNC_REQUESTING, SYNC_IN_QUEUE, SYNC_STARTED, SYNC_STATE_CHANGED, SYNC_ENDED, SYNC_ERROR } =
  SYNC_EVENT_ACTIONS;

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

export function useIsRequestingSync(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [isRequestingSync, setIsRequestingSync] = useState(syncManager?.isRequestingSync ?? false);

  const update: Handler = useCallback(
    () => setIsRequestingSync(syncManager?.isRequestingSync ?? false),
    [syncManager?.isRequestingSync],
  );

  useSyncEventListener(SYNC_REQUESTING, update);
  useSyncEventListener(SYNC_IN_QUEUE, update);
  useSyncEventListener(SYNC_STARTED, update);
  useSyncEventListener(SYNC_ENDED, update);
  useSyncEventListener(SYNC_ERROR, update);

  return isRequestingSync;
}

export function useIsInSyncQueue(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [isQueuing, setIsQueuing] = useState(syncManager?.isQueuing ?? false);

  const update: Handler = useCallback(
    () => setIsQueuing(syncManager?.isQueuing ?? false),
    [syncManager?.isQueuing],
  );

  useSyncEventListener(SYNC_IN_QUEUE, update);
  useSyncEventListener(SYNC_STARTED, update);
  useSyncEventListener(SYNC_ENDED, update);
  useSyncEventListener(SYNC_ERROR, update);

  return isQueuing;
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

export function useSyncStage(): number | null {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [syncStage, setSyncStage] = useState(syncManager?.syncStage ?? null);

  const update: Handler = useCallback(
    () => setSyncStage(syncManager?.syncStage ?? null),
    [syncManager?.syncStage],
  );

  useSyncEventListener(SYNC_STATE_CHANGED, update);

  return syncStage;
}

export function useSyncProgress(): [number | null, string | null] {
  const syncManager = useSyncContext()?.clientSyncManager;

  const [progress, setProgress] = useState(syncManager?.progress ?? null);
  const [message, setMessage] = useState(syncManager?.progressMessage ?? null);

  const update: Handler = useCallback(() => {
    setProgress(syncManager?.progress ?? null);
    setMessage(syncManager?.progressMessage ?? null);
  }, [syncManager?.progress, syncManager?.progressMessage]);

  useSyncEventListener(SYNC_REQUESTING, update);
  useSyncEventListener(SYNC_IN_QUEUE, update);
  useSyncEventListener(SYNC_STARTED, update);
  useSyncEventListener(SYNC_STATE_CHANGED, update);
  useSyncEventListener(SYNC_ENDED, update);

  return [progress, message];
}

export function useLastSyncTime(): Date | null {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(
    syncManager?.lastSuccessfulSyncTime ?? null,
  );

  const update: Handler<SyncEvents[typeof SYNC_STATE_CHANGED]> = useCallback(
    () => setLastSyncTime(syncManager?.lastSuccessfulSyncTime ?? null),
    [syncManager?.lastSuccessfulSyncTime],
  );

  useSyncEventListener(SYNC_STATE_CHANGED, update);

  return lastSyncTime;
}

export function useSyncError(): string | null {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [message, setMessage] = useState<string | null>(syncManager?.errorMessage ?? null);

  const clear: Handler<undefined> = useCallback(() => setMessage(null), []);
  const update: Handler<SyncEvents[typeof SYNC_ERROR]> = useCallback(
    event => setMessage(event.error),
    [],
  );

  useSyncEventListener(SYNC_REQUESTING, clear);
  useSyncEventListener(SYNC_IN_QUEUE, clear);
  useSyncEventListener(SYNC_STARTED, clear);
  useSyncEventListener(SYNC_ERROR, update);

  return message;
}

export function useSyncStatus() {
  const isRequestingSync = useIsRequestingSync();
  const isSyncing = useIsSyncing();
  const isQueuing = useIsInSyncQueue();
  const syncStage = useSyncStage();
  const [progress, progressMessage] = useSyncProgress();
  const errorMessage = useSyncError();
  const lastSyncTime = useLastSyncTime();

  return useMemo(
    () => ({
      errorMessage,
      isRequestingSync,
      isSyncing,
      isQueuing,
      syncStage,
      progress,
      progressMessage,
      lastSyncTime,
    }),
    [
      errorMessage,
      isRequestingSync,
      isSyncing,
      isQueuing,
      syncStage,
      progress,
      progressMessage,
      lastSyncTime,
    ],
  );
}
