import log from 'winston';
import { SyncSnapshotAttributes } from '@tupaia/sync';
import { post, stream } from '../api';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

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
 * Secondly, the size we measure is a lower bound, not the real body size: `JSON.stringify().length`
 * counts UTF-16 code units, whereas `Content-Length` counts UTF-8 bytes. Base64 image data is ASCII
 * so it measures exactly, but text answers in a non-Latin script are up to three bytes per unit. If
 * this budget is ever raised close to the server’s limit, switch to counting encoded bytes first —
 * otherwise an under-measured page would be rejected in exactly those countries and nowhere else.
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
  sessionId: string,
  changes: SyncSnapshotAttributes[],
  deviceId: string,
  progressCallback: (total: number, progressCount: number) => void,
): Promise<void> => {
  let startOfPage = 0;
  while (startOfPage < changes.length) {
    // Fill the page up to whichever bound is reached first, measuring each record exactly once
    let endOfPage = startOfPage;
    let pageBytes = 0;
    while (endOfPage < changes.length && endOfPage - startOfPage < MAX_RECORDS_PER_PAGE) {
      const recordBytes = JSON.stringify(changes[endOfPage]).length;
      // A record larger than the whole budget still has to go somewhere, so let it have a page to
      // itself rather than stalling on an empty page
      if (pageBytes + recordBytes > MAX_PAGE_BYTES && endOfPage > startOfPage) break;
      pageBytes += recordBytes;
      endOfPage += 1;
    }

    const page = changes.slice(startOfPage, endOfPage);

    if (page.length === 1 && pageBytes > OVERSIZED_RECORD_WARNING_BYTES) {
      const [{ recordType, recordId }] = page;
      log.warn(
        `pushOutgoingChanges: ${recordType} ${recordId} is ${pageBytes} bytes on its own. A single record can’t be split across pages, so this push will fail if it exceeds the server’s limit.`,
      );
    }

    log.debug(`pushOutgoingChanges: pushing ${page.length} records (${pageBytes} bytes)`);

    await post(`sync/${sessionId}/push`, { data: { changes: page } });

    progressCallback(changes.length, endOfPage);

    startOfPage = endOfPage;
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
