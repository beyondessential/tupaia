import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatatrakWebUserRequest } from '@tupaia/types';

import { useDatabase } from './DatabaseContext';
import { generateId } from '@tupaia/database';
import { ClientSyncManager } from '../sync/ClientSyncManager';
import { CentralServerConnection } from '../sync/CentralServerConnection';

export type SyncContextType = DatatrakWebUserRequest.ResBody & {
  clientSyncManager: ClientSyncManager | null;
};

const SyncContext = createContext<SyncContextType | null>(null);

const SYNC_INTERVAL = 1000 * 30;

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientSyncManager, setClientSyncManager] = useState<ClientSyncManager | null>(null);
  const { models } = useDatabase();

  useEffect(() => {
    const init = async () => {
      if (models) {
        let deviceId = await models.localSystemFact.get('deviceId');
        if (!deviceId) {
          deviceId = `datatrak-web-${generateId()}`;
          await models?.localSystemFact.set('deviceId', deviceId);
        }
        const centralServerConnection = new CentralServerConnection(deviceId);
        const clientSyncManager = new ClientSyncManager(models, centralServerConnection);
        setClientSyncManager(clientSyncManager);

        setInterval(() => {
          clientSyncManager.runSync();
        }, SYNC_INTERVAL);
      }
    };

    init();
  }, []);

  return <SyncContext.Provider value={{ clientSyncManager }}>{children}</SyncContext.Provider>;
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }

  return context;
};
