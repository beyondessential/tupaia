import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel, ModelRegistry } from '@tupaia/database';
import { FilteredModelRegistry, sanitizeRecord, SYNC_SESSION_DIRECTION } from '@tupaia/sync';

const snapshotChangesForModel = async (model: DatabaseModel, since: number) => {
  const recordsChanged = await model.find({
    updatedAtSyncTick: {
      comparator: '>',
      comparisonValue: since,
    },
  });

  console.log(
    `snapshotChangesForModel: Found ${recordsChanged.length} for model ${model.databaseRecord} since ${since}`,
  );

  return recordsChanged.map(r => ({
    direction: SYNC_SESSION_DIRECTION.OUTGOING,
    isDeleted: !!r.deletedAt,
    recordType: model.databaseRecord,
    recordId: r.id,
    data: sanitizeRecord(r),
  }));
};

export const snapshotOutgoingChanges = async (models: FilteredModelRegistry, since: number) => {
  const invalidModelNames = Object.values(models)
    .filter(
      m =>
        ![SyncDirections.BIDIRECTIONAL, SyncDirections.PUSH_TO_CENTRAL].includes(m.syncDirection),
    )
    .map(m => m.databaseRecord);

  if (invalidModelNames.length) {
    throw new Error(
      `Invalid sync direction(s) when pushing these models from facility: ${invalidModelNames}`,
    );
  }

  // snapshot inside a "repeatable read" transaction, so that other changes made while this snapshot
  // is underway aren't included (as this could lead to a pair of foreign records with the child in
  // the snapshot and its parent missing)
  // as the snapshot only contains read queries, there will be no concurrent update issues :)
  return models.wrapInTransaction(
    async (transactingModels: ModelRegistry) => {
      // TODO: Fix this type
      let outgoingChanges: Record<string, unknown>[] = [];
      for (const model of Object.values(transactingModels)) {
        const changesForModel = await snapshotChangesForModel(model, since);
        outgoingChanges = outgoingChanges.concat(changesForModel);
      }
      return outgoingChanges;
    },
    { isolationLevel: 'repeatable_read' },
  );
};
