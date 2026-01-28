import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { FullPageLoader } from '@tupaia/ui-components';

import { useDatabaseContext } from '../hooks/database';
import { ClientSyncManager } from '../sync/ClientSyncManager';
import { useIsOfflineFirst } from './offlineFirst';
import { useIsLoggedIn } from './queries/isLoggedIn';

export interface SyncContextType {
  clientSyncManager: ClientSyncManager | null;
}

const SyncContext = createContext<SyncContextType | null>(null);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [clientSyncManager, setClientSyncManager] = useState<ClientSyncManager | null>(null);
  const queryClient = useQueryClient();
  const { models } = useDatabaseContext() || {};
  const isOfflineFirst = useIsOfflineFirst();
  const { data: isLoggedIn, error: isLoggedInError, status: isLoggedInStatus } = useIsLoggedIn();

  // Debug logging
  console.log('[SyncProvider] State', {
    isLoggedIn,
    isLoggedInError: isLoggedInError?.message,
    isLoggedInStatus,
    hasModels: !!models,
    hasClientSyncManager: !!clientSyncManager,
    isOfflineFirst,
  });

  useEffect(() => {
    if (models) {
      ClientSyncManager.getInstance(models).then(setClientSyncManager);
    }
  }, [models]);

  useEffect(() => {
    console.log('[SyncProvider] Sync service effect triggered', {
      isLoggedIn,
      isOfflineFirst,
      hasClientSyncManager: !!clientSyncManager,
    });
    
    if (isLoggedIn && isOfflineFirst && clientSyncManager) {
      console.log('[SyncProvider] Starting sync service');
      clientSyncManager.startSyncService(queryClient);

      return () => {
        console.log('[SyncProvider] Cleanup - stopping sync service', {
          isLoggedIn,
          isOfflineFirst,
        });
        clientSyncManager.stopSyncService();
      };
    }
  }, [isLoggedIn, isOfflineFirst, clientSyncManager]);

  if (!clientSyncManager && isLoggedIn) {
    return <FullPageLoader />;
  }

  return <SyncContext.Provider value={{ clientSyncManager }}>{children}</SyncContext.Provider>;
};

export const useSyncContext = (): SyncContextType | null => {
  const context = useContext(SyncContext);
  const isOfflineFirst = useIsOfflineFirst();

  if (!context && isOfflineFirst) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }

  return context;
};
