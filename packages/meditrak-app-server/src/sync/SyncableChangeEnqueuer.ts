/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { ChangeHandler, TupaiaDatabase } from '@tupaia/database';
import { MeditrakAppServerModelRegistry } from '../types';
import { getSupportedModels } from './appSupportedModels';
import { Change } from './types';
import { MeditrakSyncRecordUpdater } from './MeditrakSyncRecordUpdater';

/**
 * Adds server side changes to the meditrakSyncQueue
 */
export class SyncableChangeEnqueuer extends ChangeHandler {
  public constructor(models: MeditrakAppServerModelRegistry) {
    super(models, 'syncable-change-enqueuer');

    const stripDataFromChange = (change: Change) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { old_record, new_record, ...restOfRecord } = change;
      return [{ ...restOfRecord }];
    };

    this.changeTranslators = Object.fromEntries(
      getSupportedModels().map(model => [model, stripDataFromChange]),
    );

    // Keep all the data for surveys, as we want to check if the permissions have changed
    this.changeTranslators.survey = (change: Change) => [change];
  }

  private async refreshPermissionsBasedView(database: TupaiaDatabase) {
    try {
      const start = Date.now();
      await database.executeSql(
        `REFRESH MATERIALIZED VIEW CONCURRENTLY permissions_based_meditrak_sync_queue;`,
      );
      const end = Date.now();
      winston.info(`permissions_based_meditrak_sync_queue refresh took: ${end - start}ms`);
    } catch (error) {
      winston.error(
        `permissions_based_meditrak_sync_queue refresh failed: ${(error as Error).message}`,
      );
    }
  }

  protected async handleChanges(
    transactingModels: MeditrakAppServerModelRegistry,
    changes: Change[],
  ) {
    const syncRecordUpdater = new MeditrakSyncRecordUpdater(transactingModels);
    await syncRecordUpdater.updateSyncRecords(changes);
    await this.refreshPermissionsBasedView(transactingModels.database);
  }
}
