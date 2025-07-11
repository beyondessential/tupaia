import { groupBy } from 'lodash';

import {
  BaseDatabase,
  DatabaseModel,
  ModelRegistry,
  TABLES_WITH_TRIGGER_FOR_DELETE_QUERY,
} from '@tupaia/database';
import { sleep } from '@tupaia/utils';

import { saveCreates, saveDeletes, saveUpdates } from './saveChanges';
import { RecordType, SyncSnapshotAttributes } from '../types';
import { findSyncSnapshotRecords } from './findSyncSnapshotRecords';

// TODO: Move this to a config model RN-1668
const PERSISTED_CACHE_BATCH_SIZE = 10000;
const PAUSE_BETWEEN_PERSISTED_CACHE_BATCHES_IN_MILLISECONDS = 50;

const assertIsWithinTransaction = (database: BaseDatabase) => {
  if (!database?.isWithinTransaction()) {
    throw new Error('saveIncomingChanges must be called within a transaction');
  }
};

const switchTombstoneTrigger = async (database: BaseDatabase, enabled: boolean) => {
  const tablesWithTrigger: { table: string }[] = await database.executeSql(
    TABLES_WITH_TRIGGER_FOR_DELETE_QUERY,
  );

  const action = enabled ? 'ENABLE' : 'DISABLE';
  for (const { table } of tablesWithTrigger) {
    console.log(`${action} tombstone trigger for ${table}`);
    await database.executeSql(`
      ALTER TABLE "${table}" ${action} TRIGGER add_${table}_tombstone_on_delete;
    `);
  }
};

export const saveChangesForModel = async (
  model: DatabaseModel,
  changes: SyncSnapshotAttributes[],
) => {
  assertIsWithinTransaction(model.database);

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

  const idsForUpdate = new Set();
  const idsForDelete = new Set();

  existingRecords.forEach(existing => {
    // compares incoming and existing records by id
    const incoming = idToIncomingRecord[existing.id];
    if (existing) {
      if (incoming.isDeleted) {
        idsForDelete.add(existing.id);
      } else {
        idsForUpdate.add(existing.id);
      }
    }
  });

  const recordsForCreate = changes.filter(c => idToExistingRecord[c.data.id] === undefined);
  const recordsForUpdate = changes.filter(r => idsForUpdate.has(r.data.id)).map(({ data }) => data);

  const recordsForDelete = changes.filter(r => idsForDelete.has(r.data.id));

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

  console.log('Sync: saveIncomingChanges: Deleting existingrecords', {
    count: recordsForDelete.length,
  });
  if (recordsForDelete.length > 0) {
    await saveDeletes(model, recordsForDelete);
  }
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

export const saveIncomingSnapshotChanges = async (models: DatabaseModel[], sessionId: string) => {
  if (models.length === 0) {
    return;
  }

  assertIsWithinTransaction(models[0].database);

  await switchTombstoneTrigger(models[0].database, false);

  for (const model of models) {
    await saveChangesForModelInBatches(model, sessionId, model.databaseRecord);
  }

  await switchTombstoneTrigger(models[0].database, true);
};

export const saveIncomingInMemoryChanges = async (
  models: ModelRegistry,
  changes: SyncSnapshotAttributes[],
) => {
  if (changes.length === 0) {
    return;
  }

  assertIsWithinTransaction(models.database);

  await switchTombstoneTrigger(models.database, false);

  const groupedChanges = groupBy(changes, 'record_type');
  for (const [recordType, modelChanges] of Object.entries(groupedChanges)) {
    const model = models.getModelForDatabaseRecord(recordType);
    await saveChangesForModel(model, modelChanges);
  }

  await switchTombstoneTrigger(models.database, true);
};
