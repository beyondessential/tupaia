import log from 'winston';

import { DatabaseModel } from '@tupaia/database';
import { getSnapshotTableName, sanitizeRecord } from '@tupaia/sync';
import type { DatatrakDatabase } from '../database/DatatrakDatabase';
import { assertModelsForPush } from './assertModelsForPush';
import { paginateBySize } from './paginateBySize';

/**
 * Most data we read into memory at once while snapshotting.
 *
 * A Photo answer holds its image inline as a base64 data URL, several megabytes each. Reading every
 * outgoing record at once (as we used to) held three responses of 20 photos each — hundreds of
 * megabytes — in PGlite’s WebAssembly memory, the worker and the main thread at the same time, and
 * kept it all for the whole push. On a 2.5–3 GB phone, Android killed the page for it. So records
 * are copied into the session’s snapshot table a chunk at a time, and pushed from there.
 */
const MAX_CHUNK_BYTES = 5 * 1024 * 1024;
const MAX_CHUNK_RECORDS = 1000;

const snapshotChangesForModel = async (
  model: DatabaseModel,
  database: DatatrakDatabase,
  tableName: string,
  since: number,
  cancelIfAppIsWaiting?: () => void,
) => {
  const recordType = model.databaseRecord;

  // Sizes only, so that each chunk can be read whole without reading everything. Postgres builds
  // each row’s JSON one at a time to measure it, so this stays small however big the rows are
  const changes: { id: string; bytes: number }[] = await database.executeSql(
    `SELECT id, octet_length(row_to_json(t)::text) AS bytes
      FROM ?? AS t
      WHERE updated_at_sync_tick > ?
      ORDER BY id`,
    [recordType, since],
  );

  let snapshotted = 0;
  for (const chunk of paginateBySize(changes, MAX_CHUNK_BYTES, MAX_CHUNK_RECORDS)) {
    cancelIfAppIsWaiting?.();
    const records = await model.find({ id: chunk.map(({ id }) => id) });
    if (records.length === 0) continue;
    await database.executeSql(
      `INSERT INTO ${tableName} (record_type, is_deleted, data)
        VALUES ${records.map(() => '(?, ?, ?)').join(', ')}`,
      records.flatMap(r => [recordType, Boolean(r.is_deleted), JSON.stringify(sanitizeRecord(r))]),
    );
    snapshotted += records.length;
  }

  log.debug(`snapshotChangesForModel: Found ${snapshotted} for model ${recordType} since ${since}`);
  return snapshotted;
};

/**
 * Copies every record changed since `since` into the session’s snapshot table, ready for
 * {@link pushOutgoingChanges} to send a page at a time. Run inside a repeatable-read transaction,
 * along with creating that table, so the snapshot is one point in time.
 *
 * Reads one model at a time, rather than all of them at once. `cancelIfAppIsWaiting` throws from
 * inside one of these reads, and `Promise.all` rejects on the first throw, so the transaction
 * would start rolling back with the sibling reads still outstanding against it — and nothing left
 * awaiting them to handle their rejections. PGlite serialises the reads on its single connection
 * anyway, so running them in turn costs nothing.
 *
 * @param cancelIfAppIsWaiting Called before reading each chunk of changes; throws to cancel
 * @returns How many records were snapshotted
 */
export const snapshotOutgoingChanges = async (
  models: DatabaseModel[],
  database: DatatrakDatabase,
  sessionId: string,
  since: number,
  cancelIfAppIsWaiting?: () => void,
) => {
  console.groupCollapsed('Snapshotting outgoing changes');
  const startTime = performance.now();

  assertModelsForPush(models);
  const tableName = getSnapshotTableName(sessionId);

  let total = 0;
  for (const model of models) {
    cancelIfAppIsWaiting?.();
    total += await snapshotChangesForModel(model, database, tableName, since, cancelIfAppIsWaiting);
  }

  console.groupEnd();
  console.log(`Snapshotted outgoing changes in ${performance.now() - startTime} ms`);

  return total;
};
