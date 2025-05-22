import { groupBy } from 'lodash';

import { DatabaseModel, ModelRegistry } from '@tupaia/database';

import { saveCreates, saveDeletes, saveUpdates } from './saveChanges';
import { ModelSanitizeArgs, SyncSnapshotAttributes } from '../types';

export const saveChangesForModel = async (
  model: DatabaseModel,
  changes: SyncSnapshotAttributes[],
  isCentralServer: boolean,
) => {
  const sanitizeData = (d: ModelSanitizeArgs) => d;

  // split changes into create, update, delete
  const incomingRecords = changes.filter(c => c.data.id).map(c => c.data);
  const idsForIncomingRecords = incomingRecords.map(r => r.id);
  // add all records that already exist in the db to the list to be updated
  // even if they are being deleted or restored, we should also run an update query to keep the data in sync
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

  console.log('idToIncomingRecord', idToIncomingRecord);
  existingRecords.forEach((existing: any) => {
    // compares incoming and existing records by id
    const incoming = idToIncomingRecord[existing.id];
    idsForUpdate.add(existing.id);

    if (!existing.deletedAt && incoming?.isDeleted) {
      idsForDelete.add(existing.id);
    }
    if (existing.deletedAt && incoming?.isDeleted) {
      // don't do anything related to deletion if incoming record
      // is deleted and existing record is already deleted
    }
  });
  const recordsForCreate = changes
    .filter(c => idToExistingRecord[c.data.id] === undefined)
    .map(({ data, isDeleted }) => {
      // validateRecord(data, null); TODO add in validation
      // pass in 'isDeleted' to be able to create new records even if they are soft deleted.
      return { ...sanitizeData(data), isDeleted };
    });
  const recordsForUpdate = changes
    .filter(r => idsForUpdate.has(r.data.id))
    .map(({ data }) => {
      // validateRecord(data, null); TODO add in validation
      return sanitizeData(data);
    });
  const recordsForDelete = changes
    .filter(r => idsForDelete.has(r.data.id))
    .map(({ data }) => {
      // validateRecord(data, null); TODO add in validation
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
    await saveUpdates(model, recordsForUpdate, idToExistingRecord, isCentralServer);
  }

  console.log('Sync: saveIncomingChanges: Soft deleting old records', {
    // TODO: fix console.log
    count: recordsForDelete.length,
  });
  if (recordsForDelete.length > 0) {
    await saveDeletes(model, recordsForDelete);
  }
};

export const saveIncomingChanges = async (
  models: ModelRegistry,
  changes: SyncSnapshotAttributes[],
  isCentralServer: boolean,
) => {
  const groupedChanges = groupBy(changes, 'record_type');
  for (const [recordType, modelChanges] of Object.entries(groupedChanges)) {
    const model = models.getModelForDatabaseRecord(recordType);
    await saveChangesForModel(model, modelChanges, isCentralServer);
  }
};
