import log from 'winston';

import { BaseDatabase, isMigrationInProgress } from '@tupaia/database';
import { ScheduledTask } from '@tupaia/server-utils';
import { CentralSyncManager } from '../sync';
import { SyncServerModelRegistry } from '../types';

export class SyncLookupPopulator extends ScheduledTask {
  private syncManager: CentralSyncManager;

  private database: BaseDatabase;

  constructor(models: SyncServerModelRegistry, syncManager: CentralSyncManager) {
    super(models, 'SyncLookupPopulator', '*/20 * * * * *');
    this.syncManager = syncManager;
    this.database = models.database;
  }

  async run() {
    // Skip while a migration is running: updateLookupTable reads/writes tables the migration
    // may be altering, so it would either error against a half-migrated schema or hold locks
    // that block the migration's DDL. It resumes automatically on the next tick once done.
    if (await isMigrationInProgress(this.database)) {
      log.info('SyncLookupPopulator: skipping run — database migrations in progress');
      return;
    }
    log.info('SyncLookupPopulator.run(): updating lookup table');
    await this.syncManager.updateLookupTable();
  }
}
