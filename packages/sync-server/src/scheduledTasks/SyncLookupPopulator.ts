import log from 'winston';

import { ScheduledTask } from '@tupaia/server-utils';
import { CentralSyncManager } from '../sync';
import { ModelRegistry } from '@tupaia/database';

export class SyncLookupPopulator extends ScheduledTask {
  private syncManager: CentralSyncManager;
  
  constructor(models: ModelRegistry, syncManager: CentralSyncManager) {
    super(models, 'SyncLookupPopulator', '*/20 * * * * *');
    this.syncManager = syncManager;
  }

  async run() {
    log.info('SyncLookupPopulator.run(): updating lookup table');
    await this.syncManager.updateLookupTable();
  }
}
