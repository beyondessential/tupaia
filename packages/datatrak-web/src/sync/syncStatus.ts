import { useCallback, useEffect, useState } from 'react';

import { useSyncContext } from '../api/SyncContext';
import { SYNC_EVENT_ACTIONS } from '../types';

export function useIsRequestingSync(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [isRequestingSync, setIsRequestingSync] = useState(syncManager?.isRequestingSync ?? false);

  const update = useCallback(
    () => setIsRequestingSync(syncManager?.isRequestingSync ?? false),
    [syncManager?.isRequestingSync],
  );

  useEffect(() => {
    const eventTypes = [
      SYNC_EVENT_ACTIONS.SYNC_REQUESTING,
      SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE,
      SYNC_EVENT_ACTIONS.SYNC_STARTED,
      SYNC_EVENT_ACTIONS.SYNC_ENDED,
      SYNC_EVENT_ACTIONS.SYNC_ERROR,
    ];
    for (const type of eventTypes) syncManager?.emitter?.on(type, update);
    return () => {
      for (const type of eventTypes) syncManager?.emitter?.off(type, update);
    };
  }, [syncManager?.emitter, update]);

  return isRequestingSync;
}

export function useIsInSyncQueue(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [isQueuing, setIsQueuing] = useState(syncManager?.isQueuing ?? false);

  const update = useCallback(
    () => setIsQueuing(syncManager?.isQueuing ?? false),
    [syncManager?.isQueuing],
  );

  useEffect(() => {
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE, update);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_STARTED, update);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_ENDED, update);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_ERROR, update);
    return () => {
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE, update);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_STARTED, update);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_ENDED, update);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_ERROR, update);
    };
  }, [syncManager?.emitter, update]);

  return isQueuing;
}

export function useIsSyncing(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [isSyncing, setIsSyncing] = useState(syncManager?.isSyncing ?? false);

  const set = useCallback(() => setIsSyncing(true), []);
  const unset = useCallback(() => setIsSyncing(false), []);

  useEffect(() => {
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_STARTED, set);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_ENDED, unset);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_ERROR, unset);
    return () => {
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_STARTED, set);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_ENDED, unset);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_ERROR, unset);
    };
  }, [syncManager?.emitter, set, unset]);

  return isSyncing;
}

export function useSyncStage(): number | null {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [syncStage, setSyncStage] = useState(syncManager?.syncStage ?? null);

  const update = useCallback(
    () => setSyncStage(syncManager?.syncStage ?? null),
    [syncManager?.syncStage],
  );

  useEffect(() => {
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED, update);
    return () => void syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED, update);
  }, [syncManager?.emitter, update]);

  return syncStage;
}

export function useSyncProgress(): [number | null, string | null] {
  const syncManager = useSyncContext()?.clientSyncManager;

  const [progress, setProgress] = useState(syncManager?.progress ?? null);
  const [message, setMessage] = useState(syncManager?.progressMessage ?? null);

  const update = useCallback(() => {
    setProgress(syncManager?.progress ?? null);
    setMessage(syncManager?.progressMessage ?? null);
  }, [syncManager?.progress, syncManager?.progressMessage]);

  useEffect(() => {
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_REQUESTING, update);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE, update);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_STARTED, update);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED, update);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_ENDED, update);
    return () => void syncManager?.emitter?.off('*', update);
  }, [syncManager?.emitter, update]);

  return [progress, message];
}

export function useLastSyncTime(): Date | null {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(
    syncManager?.lastSuccessfulSyncTime ?? null,
  );

  const update = useCallback(
    () => setLastSyncTime(syncManager?.lastSuccessfulSyncTime ?? null),
    [syncManager?.lastSuccessfulSyncTime],
  );

  useEffect(() => {
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED, update);
    return () => void syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED, update);
  }, [syncManager?.emitter, update]);

  return lastSyncTime;
}

export function useSyncError(): string | null {
  const syncManager = useSyncContext()?.clientSyncManager;
  const [message, setMessage] = useState<string | null>(null);

  const update = useCallback(event => setMessage(event.error), []);
  const clear = useCallback(() => setMessage(null), []);

  useEffect(() => {
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_REQUESTING, clear);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE, clear);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_STARTED, clear);
    syncManager?.emitter?.on(SYNC_EVENT_ACTIONS.SYNC_ERROR, update);
    return () => {
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_REQUESTING, clear);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE, clear);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_STARTED, clear);
      syncManager?.emitter?.off(SYNC_EVENT_ACTIONS.SYNC_ERROR, update);
    };
  }, [clear, syncManager?.emitter, update]);

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

  return {
    errorMessage,
    isRequestingSync,
    isSyncing,
    isQueuing,
    syncStage,
    progress,
    progressMessage,
    lastSyncTime,
  };
}
