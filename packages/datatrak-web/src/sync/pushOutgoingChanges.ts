import log from 'winston';
import { getSnapshotTableName, SYNC_SESSION_DIRECTION } from '@tupaia/sync';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';
import { post, stream } from '../api';
import type { DatatrakDatabase } from '../database/DatatrakDatabase';
import { paginateBySize } from './paginateBySize';

// TODO: Move to config model RN-1668
const MAX_RECORDS_PER_PAGE = 10000;

/**
 * Largest serialised page we will attempt to POST, in bytes.
 *
 * Paging by record count alone leaves the request size unbounded, because a single record can be
 * arbitrarily large — a Photo answer holds its image inline as a base64 data URL, so one row can be
 * several megabytes. A response with 15 photos built an 86 MB page, which nginx rejected on
 * `client_max_body_size` before it ever reached the server (hence nothing in the server logs, and
 * only `Network Error` on the client, because nginx’s error response carries no CORS headers).
 *
 * That failure can’t recover on its own: the next sync snapshots the same records from the same
 * tick, rebuilds the same page, and fails identically, so the device never syncs again.
 *
 * Deliberately far below the 50 MB that nginx and the server’s body parser allow, for two reasons.
 *
 * Firstly, `axios.defaults.timeout` gives a request three minutes total, so a page much larger than
 * this can’t finish on the connections this app is used on — a 50 MB page needs better than 2.5
 * Mbps up, and would fail on timeout rather than size. A failed page also loses its whole page of
 * work, since we don’t retry.
 *
 * Secondly, it bounds memory: while a page is sent, a few copies of it are in memory at once.
 *
 * Sizes are UTF-8 bytes of the stored JSON, as Postgres measures them, so they match what
 * `Content-Length` will count.
 */
const MAX_PAGE_BYTES = 5 * 1024 * 1024;

/**
 * A single record above this size gets a warning when we push it.
 *
 * Records over {@link MAX_PAGE_BYTES} are normal — one Photo answer is comfortably over it — so
 * being alone on a page isn’t worth mentioning. What is worth mentioning is a record so large that
 * it is approaching the 50 MB the server accepts, because a single record can’t be split across
 * pages: paging can’t save it, and the fix has to be upstream in whatever produced a row that big.
 */
const OVERSIZED_RECORD_WARNING_BYTES = 25 * 1024 * 1024;

export const pushOutgoingChanges = async (
  database: DatatrakDatabase,
  sessionId: string,
  deviceId: string,
  progressCallback: (total: number, progressCount: number) => void,
): Promise<void> => {
  const tableName = getSnapshotTableName(sessionId);

  // Sizes only: the records themselves are read a page at a time, so however many photos are
  // waiting, only about one page of them is ever in memory (see snapshotOutgoingChanges)
  const sizes: { id: number; bytes: number }[] = await database.executeSql(
    `SELECT id::integer AS id, octet_length(data::text) AS bytes FROM ${tableName} ORDER BY id`,
  );
  const pages = paginateBySize(sizes, MAX_PAGE_BYTES, MAX_RECORDS_PER_PAGE);

  let pushedCount = 0;
  for (const page of pages) {
    const pageBytes = page.reduce((sum, { bytes }) => sum + bytes, 0);
    const [firstId, lastId] = [page[0].id, page[page.length - 1].id];

    if (page.length === 1 && pageBytes > OVERSIZED_RECORD_WARNING_BYTES) {
      const [{ record_type: recordType, record_id: recordId }]: {
        record_type: string;
        record_id: string;
      }[] = await database.executeSql(
        `SELECT record_type, data->>'id' AS record_id FROM ${tableName} WHERE id = ?`,
        [firstId],
      );
      log.warn(
        `pushOutgoingChanges: ${recordType} ${recordId} is ${pageBytes} bytes on its own. A single record can’t be split across pages, so this push will fail if it exceeds the server’s limit.`,
      );
    }

    log.debug(`pushOutgoingChanges: pushing ${page.length} records (${pageBytes} bytes)`);

    /*
     * Postgres builds the request body, and we send that one string as it is. Reading the rows
     * as objects and letting axios serialise them again made about six copies of every photo on
     * its way out (PGlite's, the worker's, the main thread's, the parsed object, the JSON text,
     * the browser's), and the garbage piled up faster than it was collected: pushing 7.5 MB
     * photos one at a time still swung the page by ~500 MB on a 2.5 GB phone.
     *
     * The `json` column holds the text exactly as JSON.stringify wrote it during the snapshot, so
     * `data` goes out byte for byte as before.
     */
    const [{ body }]: { body: string }[] = await database.executeSql(
      `SELECT '{"changes":[' || string_agg(
          json_build_object(
            'direction', ?::text,
            'recordType', record_type,
            'recordId', data->>'id',
            'isDeleted', is_deleted,
            'data', data
          )::text,
          ',' ORDER BY id
        ) || ']}' AS body
        FROM ${tableName}
        WHERE id BETWEEN ? AND ?`,
      [SYNC_SESSION_DIRECTION.OUTGOING, firstId, lastId],
    );

    await post(`sync/${sessionId}/push`, {
      data: body,
      headers: { 'Content-Type': 'application/json' },
      // Send the string as is. axios’s default would JSON.parse it first, just to check it
      transformRequest: [(data: string) => data],
    });

    pushedCount += page.length;
    progressCallback(sizes.length, pushedCount);
  }

  for await (const { kind, message } of stream(() => ({
    method: 'PUT',
    endpoint: `sync/${sessionId}/push/complete`,
    options: { deviceId },
  }))) {
    handler: switch (kind) {
      case SYNC_STREAM_MESSAGE_KIND.PUSH_WAITING:
        // still waiting
        break handler;
      case SYNC_STREAM_MESSAGE_KIND.END:
        // Check for errors in the END message
        if (message?.error) {
          throw new Error(message.error);
        }
        return;
      default:
        log.warn(`Unexpected message kind: ${kind}`);
    }
  }
};
