import { groupBy } from 'es-toolkit';

import { DatabaseModel, SqlQuery, TupaiaDatabase } from '@tupaia/database';

import { SYNC_SESSION_DIRECTION } from '../constants';
import { findSyncSnapshotRecords } from './findSyncSnapshotRecords';

/**
 * Bump the updated_at_sync_tick for all records that require a repull
 * So that they are pulled again in the next sync
 * Records generally require repull when they are changed by some side effect
 * of incoming sync, e.g. uploading images or files to S3 and repull the answer with the new URLs
 */
export const bumpSyncTickForRepull = async (
  database: TupaiaDatabase,
  models: DatabaseModel[],
  sessionId: string,
) => {
  // No need to load records in batches for memory issue as
  // the number of records that require repull should be small
  const records = await findSyncSnapshotRecords(
    database,
    sessionId,
    undefined,
    undefined,
    undefined,
    SYNC_SESSION_DIRECTION.INCOMING,
    'requires_repull IS TRUE',
  );

  const recordsByType = groupBy(records, 'recordType');

  for (const [recordType, records] of Object.entries(recordsByType)) {
    const model = models.find(model => model.databaseRecord === recordType);
    if (!model) {
      throw new Error(`Model ${recordType} not found`);
    }

    const ids = records.map(r => r.recordId);

    await database.executeSql(
      `
        UPDATE ${model.databaseRecord}
        SET updated_at_sync_tick = 1
        WHERE id IN ${SqlQuery.record(ids)}
        RETURNING id;
      `,
      ids,
    );
  }
};
