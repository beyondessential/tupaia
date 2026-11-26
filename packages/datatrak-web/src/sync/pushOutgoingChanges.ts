import log from 'winston';
import { SyncSnapshotAttributes } from '@tupaia/sync';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';
import { post, stream, supportsRequestStreams, pushChangesAsStream } from '../api';

// TODO: Move to config model RN-1668
const LIMIT = 10000;

type ProgressCallback = (total: number, progressCount: number) => void;

/**
 * Buffered push: send changes as a series of JSON POSTs, one per page. Each page is fully
 * serialised into a request body, so it is bounded by the request-body size cap (see nginx
 * `client_max_body_size` and the express `bodyParser.json` limit). Kept as a fallback for runtimes
 * that do not support streaming request bodies.
 */
const pushBufferedChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
  progressCallback: ProgressCallback,
): Promise<void> => {
  let startOfPage = 0;
  while (startOfPage < changes.length) {
    const endOfPage = Math.min(startOfPage + LIMIT, changes.length);
    const page = changes.slice(startOfPage, endOfPage);

    await post(`sync/${sessionId}/push`, { data: { changes: page } });

    progressCallback(changes.length, endOfPage);

    startOfPage = endOfPage;
  }
};

/**
 * Streaming push: send changes frame by frame over a single streaming request body, so the total
 * submission size is no longer bounded by the request-body size cap. This is the path that lets
 * photo-heavy submissions (base64 photos inline) sync without hitting the ~50 MB ceiling.
 */
const pushStreamedChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
  progressCallback: ProgressCallback,
): Promise<void> => {
  await pushChangesAsStream(`sync/${sessionId}/push/stream`, changes, sent =>
    progressCallback(changes.length, sent),
  );
};

export const pushOutgoingChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
  deviceId: string,
  progressCallback: ProgressCallback,
): Promise<void> => {
  // Prefer the streaming push when the runtime supports streaming request bodies; otherwise fall
  // back to the buffered push so no browser regresses.
  if (supportsRequestStreams()) {
    await pushStreamedChanges(sessionId, changes, progressCallback);
  } else {
    await pushBufferedChanges(sessionId, changes, progressCallback);
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
