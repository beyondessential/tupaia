import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { FullPageLoader } from '@tupaia/ui-components';

import { useDatabaseContext } from '../hooks/database';
import { ClientSyncManager } from '../sync/ClientSyncManager';
import { useIsOfflineFirst } from './offlineFirst';
import { useIsLoggedIn } from './queries/isLoggedIn';
import { getDeviceId } from '../sync/getDeviceId';

export interface SyncContextType {
  clientSyncManager: ClientSyncManager | null;
}

const SyncContext = createContext<SyncContextType | null>(null);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [clientSyncManager, setClientSyncManager] = useState<ClientSyncManager | null>(null);
  const queryClient = useQueryClient();
  const { models } = useDatabaseContext() || {};
  const isOfflineFirst = useIsOfflineFirst();
  const { data: isLoggedIn } = useIsLoggedIn();

  useEffect(() => {
    const initSyncManager = async () => {
      // Only initialize the sync manager if it doesn't exist yet
      if (!clientSyncManager && models) {
        const deviceId = await getDeviceId(models);
        setClientSyncManager(new ClientSyncManager(models, deviceId));
      }
    };

    initSyncManager();
  }, [models]);

  useEffect(() => {
    if (isLoggedIn && isOfflineFirst && clientSyncManager) {
      clientSyncManager.startSyncService(queryClient);

      return () => {
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
