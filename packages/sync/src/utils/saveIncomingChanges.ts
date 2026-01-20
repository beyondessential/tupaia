import winston from 'winston';
import { groupBy } from 'lodash';

import { BaseDatabase, DatabaseModel, ModelRegistry } from '@tupaia/database';
import { sleep } from '@tupaia/utils';

import { saveCreates, saveDeletes, saveUpdates } from './saveChanges';
import { ModelSanitizeArgs, RecordType, SyncSnapshotAttributes } from '../types';
import { findSyncSnapshotRecords } from './findSyncSnapshotRecords';
import { sortModelsByDependencyOrder } from './getDependencyOrder';

// TODO: Move this to a config model RN-1668
const PERSISTED_CACHE_BATCH_SIZE = 10000;
const PAUSE_BETWEEN_PERSISTED_CACHE_BATCHES_IN_MILLISECONDS = 50;

const assertIsWithinTransaction = (database: BaseDatabase) => {
  if (!database?.isWithinTransaction) {
    throw new Error('saveIncomingChanges must be called within a transaction');
  }
};

export const saveChangesForModel = async (
  model: DatabaseModel,
  changes: SyncSnapshotAttributes[],
  isCentralServer: boolean,
  progressCallback?: (recordsProcessed: number) => void,
) => {
  const sanitizeData = (d: ModelSanitizeArgs) =>
    isCentralServer ? model.sanitizeForCentralServer(d) : model.sanitizeForClient(d);

  // split changes into create, update
  const incomingRecords = changes.filter(c => c.data.id).map(c => c.data);
  const idsForIncomingRecords = incomingRecords.map(r => r.id);
  // add all records that already exist in the db to the list to be updated
  const existingRecords = await model.findManyById(idsForIncomingRecords);

  const idToExistingRecord: Record<number, (typeof existingRecords)[0]> = Object.fromEntries(
    existingRecords.map((e: any) => [e.id, e]),
  );
  const recordsForCreate = [];
  const recordsForUpdate = [];
  const recordsForDelete = [];

  for (const change of changes) {
    const { data, isDeleted } = change;

    if (idToExistingRecord[data.id] === undefined) {
      if (!isDeleted) {
        recordsForCreate.push(sanitizeData(data));
      }
      // If it's a new record and it's deleted, ignore it
    } else if (isDeleted) {
      recordsForDelete.push(sanitizeData(data));
    } else {
      recordsForUpdate.push(sanitizeData(data));
    }
  }

  // Should delete records first to avoid foreign key constraints
  winston.debug(
    `Sync: saveIncomingChanges for ${model.databaseRecord}: Deleting existing records`,
    {
      count: recordsForDelete.length,
    },
  );
  if (recordsForDelete.length > 0) {
    await saveDeletes(model, recordsForDelete, 1000, progressCallback);
  }

  // run each import process
  winston.debug(`Sync: saveIncomingChanges for ${model.databaseRecord}: Creating new records`, {
    count: recordsForCreate.length,
  });
  if (recordsForCreate.length > 0) {
    await saveCreates(model, recordsForCreate, 1000, progressCallback);
  }

  winston.debug(
    `Sync: saveIncomingChanges for ${model.databaseRecord}: Updating existing records`,
    {
      count: recordsForUpdate.length,
    },
  );
  if (recordsForUpdate.length > 0) {
    await saveUpdates(model, recordsForUpdate, 1000, progressCallback);
  }
};

const saveChangesForModelInBatches = async (
  model: DatabaseModel,
  sessionId: string,
  recordType: RecordType,
  isCentralServer: boolean,
  progressCallback?: (recordsProcessed: number) => void,
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
      winston.debug('Sync: Persisting cache to table', {
        count: batchRecords.length,
      });

      await saveChangesForModel(model, batchRecords, isCentralServer, progressCallback);

      await sleep(PAUSE_BETWEEN_PERSISTED_CACHE_BATCHES_IN_MILLISECONDS);
    } catch (error) {
      winston.error('Failed to save changes');
      throw error;
    }
  }
};

export const saveIncomingSnapshotChanges = async (
  models: DatabaseModel[],
  sessionId: string,
  isCentralServer: boolean,
  progressCallback?: (recordsProcessed: number) => void,
) => {
  if (models.length === 0) {
    return;
  }

  assertIsWithinTransaction(models[0].database);
  const sortedModels = await sortModelsByDependencyOrder(models);

  for (const model of sortedModels) {
    await saveChangesForModelInBatches(
      model,
      sessionId,
      model.databaseRecord,
      isCentralServer,
      progressCallback,
    );
  }
};

export const saveChangesFromMemory = async (
  models: ModelRegistry,
  changes: SyncSnapshotAttributes[],
  isCentralServer: boolean,
  progressCallback: (recordsProcessed: number) => void,
) => {
  if (changes.length === 0) {
    return;
  }

  assertIsWithinTransaction(models.database);

  const groupedChanges = groupBy(changes, 'recordType');
  for (const [recordType, modelChanges] of Object.entries(groupedChanges)) {
    const model = models.getModelForDatabaseRecord(recordType);
    await saveChangesForModel(model, modelChanges, isCentralServer, progressCallback);
  }
};
