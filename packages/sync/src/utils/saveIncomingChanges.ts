import { groupBy, partition } from 'es-toolkit';
import winston from 'winston';

import {
  BaseDatabase,
  DatabaseModel,
  ModelRegistry,
  PublicSchemaRecordName,
} from '@tupaia/database';
import { sleep } from '@tupaia/utils';
import { ModelSanitizeArgs, SyncSnapshotAttributes } from '../types';
import { findSyncSnapshotRecords } from './findSyncSnapshotRecords';
import { sortModelsByDependencyOrder } from './getDependencyOrder';
import { saveCreates, saveDeletes, saveUpdates } from './saveChanges';

// TODO: Move this to a config model RN-1668
const PERSISTED_CACHE_BATCH_SIZE = 10000;
const PAUSE_BETWEEN_PERSISTED_CACHE_BATCHES_IN_MILLISECONDS = 50;

const assertIsWithinTransaction = (database: BaseDatabase) => {
  if (!database?.isWithinTransaction) {
    throw new Error('saveIncomingChanges must be called within a transaction');
  }
};

export const saveDeletesForModel = async (
  model: DatabaseModel,
  changes: SyncSnapshotAttributes[],
  progressCallback?: (recordsProcessed: number) => void,
) => {
  // split changes into create, update
  const deletedRecords = changes.filter(c => c.isDeleted).map(c => c.data);

  // Should delete records first to avoid foreign key constraints
  winston.debug(
    `Sync: saveIncomingChanges for ${model.databaseRecord}: Deleting existing records`,
    {
      count: deletedRecords.length,
    },
  );
  if (deletedRecords.length > 0) {
    await saveDeletes(model, deletedRecords, 1000, progressCallback);
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

  const idsForIncomingRecords = changes.filter(c => c.data.id).map(c => c.data.id);

  // add all records that already exist in the db to the list to be updated
  const existingRecords = (await model.findManyById(
    idsForIncomingRecords,
    {},
    { columns: [model.fullyQualifyColumn('id')] },
  )) as { id: string }[];
  const existingRecordIds = new Set(existingRecords.map(r => r.id));

  // split changes into create, update
  const [createChanges, updateChanges] = partition(changes, c => !existingRecordIds.has(c.data.id));
  const recordsForCreate = createChanges.map(c => sanitizeData(c.data));
  const recordsForUpdate = updateChanges.map(c => sanitizeData(c.data));

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
    await saveUpdates(model, recordsForUpdate, isCentralServer, 1000, progressCallback);
  }
};

const processSyncSnapshotInBatches = async (
  model: DatabaseModel,
  sessionId: string,
  recordType: PublicSchemaRecordName,
  isDeleted: boolean,
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
      undefined,
      `is_deleted IS ${isDeleted ? 'TRUE' : 'FALSE'}`,
    );
    fromId = batchRecords[batchRecords.length - 1]?.id;

    try {
      winston.debug('Sync: Persisting cache to table', {
        count: batchRecords.length,
      });

      if (isDeleted) {
        await saveDeletesForModel(model, batchRecords, progressCallback);
      } else {
        await saveChangesForModel(model, batchRecords, isCentralServer, progressCallback);
      }

      await sleep(PAUSE_BETWEEN_PERSISTED_CACHE_BATCHES_IN_MILLISECONDS);
    } catch (error) {
      winston.error('Failed to save changes');
      throw error;
    }
  }
};

const saveChangesForModelInBatches = (
  model: DatabaseModel,
  sessionId: string,
  recordType: PublicSchemaRecordName,
  isCentralServer: boolean,
  progressCallback?: (recordsProcessed: number) => void,
) =>
  processSyncSnapshotInBatches(
    model,
    sessionId,
    recordType,
    false,
    isCentralServer,
    progressCallback,
  );

const saveDeletesForModelInBatches = (
  model: DatabaseModel,
  sessionId: string,
  recordType: PublicSchemaRecordName,
  progressCallback?: (recordsProcessed: number) => void,
) => processSyncSnapshotInBatches(model, sessionId, recordType, true, false, progressCallback);

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
  const sortedModelsForChanges = await sortModelsByDependencyOrder(models);
  const sortedModelsForDeletes = [...sortedModelsForChanges].reverse();

  // Delete records first in the reverse order to avoid foreign key constraints
  console.groupCollapsed('Saving incoming snapshot changes');
  const startTime = performance.now();
  console.group('DELETE phase');
  for (const model of sortedModelsForDeletes) {
    await saveDeletesForModelInBatches(model, sessionId, model.databaseRecord, progressCallback);
  }
  console.groupEnd();

  console.group('CREATE/UPDATE phase');
  // Create and update records in the order of dependencies
  for (const model of sortedModelsForChanges) {
    await saveChangesForModelInBatches(
      model,
      sessionId,
      model.databaseRecord,
      isCentralServer,
      progressCallback,
    );
  }
  console.groupEnd();
  console.groupEnd();
  console.log(`Saved incoming snapshot changes in ${performance.now() - startTime} ms`);
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

  const groupedChanges = groupBy(changes, c => c.recordType);
  for (const [recordType, modelChanges] of Object.entries(groupedChanges)) {
    const model = models.getModelForDatabaseRecord(recordType);
    const filteredModelChanges = await model.filterSyncForClient(modelChanges);
    await saveChangesForModel(model, filteredModelChanges, isCentralServer, progressCallback);
  }
};
