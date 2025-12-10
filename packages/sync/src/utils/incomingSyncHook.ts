import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

import { SYNC_SESSION_DIRECTION } from '../constants';
import { SyncSnapshotAttributes } from '../types';
import { countSyncSnapshotRecords } from './countSyncSnapshotRecords';
import { findSyncSnapshotRecords } from './findSyncSnapshotRecords';
import { insertSnapshotRecords, updateSnapshotRecords } from './manageSnapshotTable';
import { getModelsForPush } from './getModelsForDirection';

const BATCH_SIZE = 10000;

type WrapInReadOnlyTransaction = (
  wrappedFunction: (models: ModelRegistry) => Promise<void>,
) => Promise<void>;

export const incomingSyncHook = async (
  database: TupaiaDatabase,
  models: ModelRegistry,
  sessionId: string,
) => {
   // model.incomingSyncHook should return modified records without directly mutating the database.
   // Wrapped in a read-only transaction to enforce this contract and prevent inadvertent writes.
  await (models.wrapInReadOnlyTransaction as WrapInReadOnlyTransaction)(
    async (readOnlyModelsRegistry: ModelRegistry): Promise<void> => {
      const readOnlyModels = getModelsForPush(readOnlyModelsRegistry.getModels());

      for (const model of readOnlyModels) {
        const hasIncomingSyncHook =
          'incomingSyncHook' in model && typeof model.incomingSyncHook === 'function';

        if (!hasIncomingSyncHook) {
          continue;
        }

        const modelPersistedRecordsCount = await countSyncSnapshotRecords(
          database,
          sessionId,
          SYNC_SESSION_DIRECTION.INCOMING,
          model.databaseRecord,
        );

        // Load the persisted record ids in batches to avoid memory issue
        const batchCount = Math.ceil(modelPersistedRecordsCount / BATCH_SIZE);
        let fromId;

        for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
          const batchRecords = await findSyncSnapshotRecords(
            database,
            sessionId,
            fromId,
            BATCH_SIZE,
            model.databaseRecord,
            SYNC_SESSION_DIRECTION.INCOMING,
          );
          fromId = batchRecords[batchRecords.length - 1]?.id;

          // wrap in read only transaction
          const incomingSnapshotChanges = hasIncomingSyncHook
            ? await (model.incomingSyncHook as Function)(batchRecords)
            : null;

          if (incomingSnapshotChanges) {
            const { inserts = [], updates = [] } = incomingSnapshotChanges;

            if (inserts.length > 0) {
              // Mark new changes as requiring repull
              const newChangesToInsert = inserts.map((change: SyncSnapshotAttributes) => ({
                ...change,
                requiresRepull: true,
              }));

              // Insert new changes into sync_snapshot table
              await insertSnapshotRecords(database, sessionId, newChangesToInsert);
            }

            if (updates.length > 0) {
              // Mark new changes as requiring repull
              const newChangesToUpdate = updates.map((change: SyncSnapshotAttributes) => ({
                ...change,
                requiresRepull: true,
              }));

              await Promise.all(
                newChangesToUpdate.map(async (change: SyncSnapshotAttributes) => {
                  await updateSnapshotRecords(database, sessionId, change, {
                    id: change.id,
                  });
                }),
              );
            }
          }
        }
      }
    },
  );
};
