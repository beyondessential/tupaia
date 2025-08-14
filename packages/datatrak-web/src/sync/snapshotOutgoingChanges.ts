import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '@tupaia/database';
import { sanitizeRecord, SYNC_SESSION_DIRECTION, SyncSnapshotAttributes } from '@tupaia/sync';

const snapshotChangesForModel = async (
  model: DatabaseModel,
  tombstoneModel: DatabaseModel,
  since: number,
) => {
  const changedRecords = await model.find({
    updated_at_sync_tick: {
      comparator: '>',
      comparisonValue: since,
    },
  });
  const deletedRecords = await tombstoneModel.find({
    record_type: model.databaseRecord,
    updated_at_sync_tick: {
      comparator: '>',
      comparisonValue: since,
    },
  });

  const recordsChanged = [...changedRecords, ...deletedRecords];
  console.log(
    `snapshotChangesForModel: Found ${recordsChanged.length} for model ${model.databaseRecord} since ${since}`,
  );

  return recordsChanged.map(r => ({
    direction: SYNC_SESSION_DIRECTION.OUTGOING,
    recordType: model.databaseRecord,
    recordId: r.id,
    data: sanitizeRecord(r),
  })) as SyncSnapshotAttributes[];
};

export const snapshotOutgoingChanges = async (
  models: DatabaseModel[],
  tombstoneModel: DatabaseModel,
  since: number,
) => {
  const invalidModelNames = Object.values(models)
    .filter(
      m =>
        ![SyncDirections.BIDIRECTIONAL, SyncDirections.PUSH_TO_CENTRAL].includes(
          (m.constructor as typeof DatabaseModel).syncDirection,
        ),
    )
    .map(m => m.databaseRecord);

  if (invalidModelNames.length) {
    throw new Error(
      `Invalid sync direction(s) when pushing these models from client: ${invalidModelNames}`,
    );
  }

  let outgoingChanges: SyncSnapshotAttributes[] = [];
  for (const model of Object.values(models)) {
    const changesForModel = await snapshotChangesForModel(model, tombstoneModel, since);
    outgoingChanges = [...outgoingChanges, ...changesForModel];
  }
  return outgoingChanges;
};
