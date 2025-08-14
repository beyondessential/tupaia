import { CentralSyncManager } from '../sync';
import { SyncServerModelRegistry } from '../types';
import { SyncLookupPopulator } from './SyncLookupPopulator';

export const initializeScheduledTasks = (
  models: SyncServerModelRegistry,
  syncManager: CentralSyncManager,
) => {
  new SyncLookupPopulator(models, syncManager).init();
};
