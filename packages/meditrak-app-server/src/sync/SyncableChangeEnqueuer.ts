/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ChangeHandler } from '@tupaia/database';
import { MeditrakAppServerModelRegistry } from '../types';
import { getSupportedModels } from './appSupportedModels';

type Change = { record_id: string; record_type: string; type: 'update' | 'delete' };

/**
 * Adds server side changes to the meditrakSyncQueue
 */
export class SyncableChangeEnqueuer extends ChangeHandler {
  public constructor(models: MeditrakAppServerModelRegistry) {
    super(models, 'syncable-change-enqueuer');

    const stripDataFromChange = (
      change: {
        old_record: Record<string, unknown>;
        new_record: Record<string, unknown>;
      } & Change,
    ) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { old_record, new_record, ...restOfRecord } = change;
      return [{ ...restOfRecord }];
    };

    this.changeTranslators = Object.fromEntries(
      getSupportedModels().map(model => [model, stripDataFromChange]),
    );
  }

  private addToSyncQueue(transactingModels: MeditrakAppServerModelRegistry, change: Change) {
    return transactingModels.meditrakSyncQueue.updateOrCreate(
      {
        record_id: change.record_id,
      },
      {
        ...change,
        change_time: Math.random(), // Force an update, after which point the trigger will update the change_time to more complicated now() + sequence
      },
    );
  }

  protected async handleChanges(
    transactingModels: MeditrakAppServerModelRegistry,
    changes: Change[],
  ) {
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      await this.addToSyncQueue(transactingModels, change);
    }
  }
}
