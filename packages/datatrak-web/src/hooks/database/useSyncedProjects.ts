import { FACT_PROJECTS_IN_SYNC } from '@tupaia/constants';
import { useDatabaseEffect } from './useDatabaseEffect';

export const useSyncedProjects = () =>
  useDatabaseEffect(async models => {    
    const syncedProjectsFact = await models.localSystemFact.get(FACT_PROJECTS_IN_SYNC);
    const syncedProjectIds = syncedProjectsFact ? JSON.parse(syncedProjectsFact) : [];
    return syncedProjectIds;
  });
