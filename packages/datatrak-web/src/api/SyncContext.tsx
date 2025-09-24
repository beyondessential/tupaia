import React, { createContext, useContext, useState, useEffect } from 'react';
import log from 'winston';

import { DatatrakWebUserRequest } from '@tupaia/types';
import { generateId } from '@tupaia/database';
import { LoadingScreen } from '@tupaia/ui-components';

import { useDatabaseContext } from '../hooks/database';
import { ClientSyncManager } from '../sync/ClientSyncManager';
import { useIsOfflineFirst } from './offlineFirst';
import { useCurrentUserContext } from './CurrentUserContext';

export type SyncContextType = DatatrakWebUserRequest.ResBody & {
  clientSyncManager: ClientSyncManager;
};

const SyncContext = createContext<SyncContextType | null>(null);

// TODO: Move to config model RN-1668
const SYNC_INTERVAL = 1000 * 30;

export const SyncProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [clientSyncManager, setClientSyncManager] = useState<ClientSyncManager | null>(null);
  const { models } = useDatabaseContext();
  const isOfflineFirst = useIsOfflineFirst();
  const { isLoggedIn } = useCurrentUserContext();

  useEffect(() => {
    const initSyncManager = async () => {
      // Only initialize the sync manager if it doesn't exist yet
      if (!clientSyncManager && models) {
        let deviceId = await models.localSystemFact.get('deviceId');
        if (!deviceId) {
          deviceId = `datatrak-web-${generateId()}`;
          await models.localSystemFact.set('deviceId', deviceId);
        }

        const clientSyncManager = new ClientSyncManager(models, deviceId);
        setClientSyncManager(clientSyncManager);
      }
    };

    initSyncManager();
  }, [models]);

  useEffect(() => {
    if (isLoggedIn && isOfflineFirst && clientSyncManager) {
      const intervalId = setInterval(() => {
        log.info('Starting regular sync');
        clientSyncManager.triggerSync(false);
      }, SYNC_INTERVAL);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isLoggedIn, isOfflineFirst, clientSyncManager]);

  if (!clientSyncManager) {
    return <LoadingScreen />;
  }

  return <SyncContext.Provider value={{ clientSyncManager }}>{children}</SyncContext.Provider>;
};

export const useSyncContext = (): SyncContextType => {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }

  return context;
};
