import React, { createContext, useContext, useEffect, useState } from 'react';
import log from 'winston';

import { generateId } from '@tupaia/database';
import { useDatabaseContext } from '../hooks/database';
import { useProjectsInSync } from '../hooks/database/useProjectsInSync';
import { ClientSyncManager } from '../sync/ClientSyncManager';
import { useCurrentUserContext } from './CurrentUserContext';

export interface SyncContextType {
  clientSyncManager: ClientSyncManager | null;
  refetchSyncedProjectIds: () => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

// TODO: Move to config model RN-1668
const SYNC_INTERVAL = 1000 * 30;

export const SyncProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [clientSyncManager, setClientSyncManager] = useState<ClientSyncManager | null>(null);
  const [isSyncScheduled, setIsSyncScheduled] = useState(false);
  const { models } = useDatabaseContext();
  const { id: userId } = useCurrentUserContext();
  const { data: projectsInSync = [], onFetch: refetchSyncedProjectIds } = useProjectsInSync();

  useEffect(() => {
    const initSyncManager = async () => {
      // Only initialize the sync manager if it doesn't exist yet
      if (!clientSyncManager && models && userId) {
        let deviceId = await models.localSystemFact.get('deviceId');
        if (!deviceId) {
          deviceId = `datatrak-web-${generateId()}`;
          await models.localSystemFact.set('deviceId', deviceId);
        }

        const clientSyncManager = new ClientSyncManager(models, deviceId, userId);
        setClientSyncManager(clientSyncManager);
      }
    };

    initSyncManager();
  }, [models, userId]);

  useEffect(() => {
    // Only schedule the sync if conditions are met
    if (!isSyncScheduled && clientSyncManager && projectsInSync.length) {
      const intervalId = setInterval(() => {
        log.info('Starting regular sync:', { projectsInSync });
        clientSyncManager.triggerSync(projectsInSync, false);
      }, SYNC_INTERVAL);

      setIsSyncScheduled(true);

      return () => {
        clearInterval(intervalId);
        setIsSyncScheduled(false);
      };
    }
  }, [clientSyncManager, projectsInSync.length]);

  return <SyncContext.Provider value={{ clientSyncManager, refetchSyncedProjectIds }}>{children}</SyncContext.Provider>;
};

export const useSyncContext = (): SyncContextType => {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }

  return context;
};
