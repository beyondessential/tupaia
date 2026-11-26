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

    // Keep all the data for entities so the sync-record updater can read a deleted entity's
    // code and decide whether the delete should reach MediTrak (a code can have multiple
    // project-specific rows post entity-hierarchy epic; MediTrak only sees one per code).
    this.changeTranslators.entity = (change: Change) => [change];
  }

  private async refreshPermissionsBasedView(database: TupaiaDatabase) {
    await database.executeSql(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY permissions_based_meditrak_sync_queue;`,
    );
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
