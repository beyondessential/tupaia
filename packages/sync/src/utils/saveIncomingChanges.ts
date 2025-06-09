import { groupBy } from 'lodash';

import { DatabaseModel, ModelRegistry } from '@tupaia/database';

import { saveCreates, saveUpdates } from './saveChanges';
import { FilteredModelRegistry, ModelSanitizeArgs, RecordType, SyncSnapshotAttributes } from '../types';
import { findSyncSnapshotRecords } from './findSyncSnapshotRecords';
import { sleep } from '@tupaia/utils';

// TODO: Move this to a config model RN-1668
const PERSISTED_CACHE_BATCH_SIZE = 10000;
const PAUSE_BETWEEN_PERSISTED_CACHE_BATCHES_IN_MILLISECONDS = 50;

export const saveChangesForModel = async (
  model: DatabaseModel,
  changes: SyncSnapshotAttributes[],
) => {
  const sanitizeData = (d: ModelSanitizeArgs) => d;

  // split changes into create, update
  const incomingRecords = changes.filter(c => c.data.id).map(c => c.data);
  const idsForIncomingRecords = incomingRecords.map(r => r.id);
  // add all records that already exist in the db to the list to be updated
  const existingRecords = await model.findManyById(idsForIncomingRecords);

  const idToExistingRecord: Record<number, (typeof existingRecords)[0]> = Object.fromEntries(
    existingRecords.map((e: any) => [e.id, e]),
  );
  // follow the same pattern for incoming records
  // https://github.com/beyondessential/tamanu/pull/4854#discussion_r1403828225
  const idToIncomingRecord: { [key: number]: (typeof changes)[0] } = Object.fromEntries(
    changes.filter(c => c.data.id).map(e => [e.data.id, e]),
  );

  const idsForUpdate = new Set(existingRecords.map((existing: any) => existing.id));

  const recordsForCreate = changes
    .filter(c => idToExistingRecord[c.data.id] === undefined)
    .map(({ data }) => {
      return sanitizeData(data);
    });
  const recordsForUpdate = changes
    .filter(r => idsForUpdate.has(r.data.id))
    .map(({ data }) => {
      return sanitizeData(data);
    });

  // run each import process
  console.log('Sync: saveIncomingChanges: Creating new records', {
    count: recordsForCreate.length,
  });
  if (recordsForCreate.length > 0) {
    await saveCreates(model, recordsForCreate);
  }

  console.log('Sync: saveIncomingChanges: Updating existing records', {
    count: recordsForUpdate.length,
  });
  if (recordsForUpdate.length > 0) {
    await saveUpdates(model, recordsForUpdate);
  }

  // TODO: Implement deletion
};

const saveChangesForModelInBatches = async (
  model: DatabaseModel,
  sessionId: string,
  recordType: RecordType,
) => {
  let fromId;
  let batchRecords: SyncSnapshotAttributes[] | null = null;
  while (!batchRecords || batchRecords.length > 0) {
    batchRecords = await findSyncSnapshotRecords(
      model.database,
      sessionId,
      fromId,
      PERSISTED_CACHE_BATCH_SIZE,
      recordType,
    );
    fromId = batchRecords[batchRecords.length - 1]?.id;

    try {
      console.log('Sync: Persisting cache to table', {
        count: batchRecords.length,
      });

      await saveChangesForModel(model, batchRecords);

      await sleep(PAUSE_BETWEEN_PERSISTED_CACHE_BATCHES_IN_MILLISECONDS);
    } catch (error) {
      console.error('Failed to save changes');
      throw error;
    }
  }
};

export const saveIncomingSnapshotChanges = async (models: FilteredModelRegistry, sessionId: string) => {
  for (const model of Object.values(models)) {
    await saveChangesForModelInBatches(model, sessionId, model.databaseRecord);
  }
};

export const saveIncomingInMemoryChanges = async (
  models: ModelRegistry,
  changes: SyncSnapshotAttributes[],
) => {
  const groupedChanges = groupBy(changes, 'record_type');
  for (const [recordType, modelChanges] of Object.entries(groupedChanges)) {
    const model = models.getModelForDatabaseRecord(recordType);
    await saveChangesForModel(model, modelChanges);
  }
};
