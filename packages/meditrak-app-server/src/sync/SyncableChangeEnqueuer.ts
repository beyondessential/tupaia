/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ChangeHandler } from '@tupaia/database';
import { MeditrakSyncQueueModel } from '../models';
import { MeditrakAppServerModelRegistry } from '../types';

type Change = { record_id: string; record_type: string; type: 'update' | 'delete' };

/**
 * Adds server side changes to the meditrakSyncQueue
 */
export class SyncableChangeEnqueuer extends ChangeHandler {
  private readonly syncQueueModel: MeditrakSyncQueueModel;

  public constructor(models: MeditrakAppServerModelRegistry) {
    super(models);
    this.syncQueueModel = models.meditrakSyncQueue;

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

    this.changeTranslators = {
      country: stripDataFromChange,
      entity: stripDataFromChange,
      facility: stripDataFromChange,
      geographicalArea: stripDataFromChange,
      option: stripDataFromChange,
      optionSet: stripDataFromChange,
      permissionGroup: stripDataFromChange,
      question: stripDataFromChange,
      survey: stripDataFromChange,
      surveyGroup: stripDataFromChange,
      surveyScreen: stripDataFromChange,
      surveyScreenComponent: stripDataFromChange,
    };
  }

  private addToSyncQueue(change: Change) {
    this.syncQueueModel.updateOrCreate(
      {
        record_id: change.record_id,
      },
      {
        ...change,
        change_time: Math.random(), // Force an update, after which point the trigger will update the change_time to more complicated now() + sequence
      },
    );
  }

  protected async handleChanges(changes: Change[]) {
    changes.forEach(change => this.addToSyncQueue(change));
  }
}
