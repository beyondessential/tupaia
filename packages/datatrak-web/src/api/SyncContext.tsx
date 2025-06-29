import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatatrakWebUserRequest } from '@tupaia/types';

import { useDatabase } from './DatabaseContext';
import { generateId } from '@tupaia/database';
import { ClientSyncManager } from '../sync/ClientSyncManager';
import { useAccessibleProjects } from './queries/useProjects';

export type SyncContextType = DatatrakWebUserRequest.ResBody & {
  clientSyncManager: ClientSyncManager | null;
};

const SyncContext = createContext<SyncContextType | null>(null);

// TODO: Move to config model RN-1668
const SYNC_INTERVAL = 1000 * 30;

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientSyncManager, setClientSyncManager] = useState<ClientSyncManager | null>(null);
  const { models } = useDatabase();
  const { data: projects } = useAccessibleProjects();
  useEffect(() => {
    const init = async () => {
      if (models && projects?.length) {
        let deviceId = await models.localSystemFact.get('deviceId');
        if (!deviceId) {
          deviceId = `datatrak-web-${generateId()}`;
          await models.localSystemFact.set('deviceId', deviceId);
        }

        const projectIds = projects?.map(project => project.id);
        const clientSyncManager = new ClientSyncManager(models, projectIds, deviceId);
        setClientSyncManager(clientSyncManager);

        const intervalId = setInterval(() => {
          clientSyncManager.runSync();
        }, SYNC_INTERVAL);

        return () => {
          clearInterval(intervalId);
        };
      }
    };

    init();
  }, [models, projects?.length]);

  return <SyncContext.Provider value={{ clientSyncManager }}>{children}</SyncContext.Provider>;
};

export const useSyncContext = (): SyncContextType => {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }

  return context;
};
