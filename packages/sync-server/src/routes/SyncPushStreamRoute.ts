import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPushStreamRequest } from '@tupaia/types';
import { SyncSnapshotAttributes } from '@tupaia/sync';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';
import { decodeFrameStream } from '@tupaia/server-utils';

// Stage decoded changes into the session snapshot in batches, so we never hold the whole push in
// memory and each batch is validated + inserted as it arrives.
const BATCH_SIZE = 1000;

// Upper bound on the number of PUSH_CHANGE frames accepted in a single stream. Because the nginx
// location lifts the body-size cap and holds the connection open for up to an hour, without this a
// misbehaving or malicious client could drive effectively unbounded staged DB writes over one
// request. This ceiling is far above any realistic submission while bounding resource use.
const MAX_PUSH_CHANGES = 1_000_000;

// The streaming push reads framed changes directly off the request stream; it never parses
// `req.body`. `SyncServerPushStreamRequest` reflects that (its `ReqBody` is `never`), rather than
// reusing the buffered `{ changes }` request type.
export type SyncPushStreamRequest = Request<
  SyncServerPushStreamRequest.Params,
  SyncServerPushStreamRequest.ResBody,
  SyncServerPushStreamRequest.ReqBody,
  SyncServerPushStreamRequest.ReqQuery
>;

// A decoded PUSH_CHANGE frame is untrusted input off the wire, so sanity-check its shape before
// casting to SyncSnapshotAttributes (the full table-allowlist validation still runs in
// addIncomingChanges). This surfaces a clear error rather than staging a malformed record.
const isPushChangeShape = (message: unknown): message is SyncSnapshotAttributes => {
  if (typeof message !== 'object' || message === null) {
    return false;
  }
  const candidate = message as Record<string, unknown>;
  return (
    typeof candidate.recordType === 'string' &&
    typeof candidate.recordId === 'string' &&
    typeof candidate.data === 'object' &&
    candidate.data !== null
  );
};

export class SyncPushStreamRoute extends Route<SyncPushStreamRequest> {
  public async buildResponse() {
    const { ctx, params } = this.req;
    const { sessionId } = params;

    let batch: SyncSnapshotAttributes[] = [];
    let totalChanges = 0;
    let sawEnd = false;

    // Changes are staged into the session snapshot as they arrive; they are only applied to real
    // tables by the separate `push/complete` step. If decoding throws mid-stream, or the stream
    // ends without an END frame (below), we throw before completion is ever reached, so an
    // incomplete push is never persisted and the client retries from a fresh session — matching the
    // atomicity of the buffered `addIncomingChanges` path.
    //
    // The global bodyParser.json is a no-op for `application/json+frame`, so the request body is
    // still an unconsumed readable stream we can decode incrementally.
    for await (const { kind, message } of decodeFrameStream(this.req)) {
      switch (kind) {
        case SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE:
          if (!isPushChangeShape(message)) {
            throw new Error('Received a malformed PUSH_CHANGE frame in sync push stream');
          }
          totalChanges += 1;
          if (totalChanges > MAX_PUSH_CHANGES) {
            throw new Error(
              `Sync push stream exceeded the maximum of ${MAX_PUSH_CHANGES} changes`,
            );
          }
          batch.push(message);
          if (batch.length >= BATCH_SIZE) {
            await ctx.centralSyncManager.addIncomingChanges(sessionId, batch);
            batch = [];
          }
          break;
        case SYNC_STREAM_MESSAGE_KIND.END:
          sawEnd = true;
          break;
        default:
          break;
      }
    }

    // A body that ends without an END frame is a truncated/dropped push and must not be treated as
    // complete. Throw before staging the trailing batch so an incomplete stream is never half-added.
    if (!sawEnd) {
      throw new Error('Sync push stream ended without an END frame');
    }

    if (batch.length > 0) {
      await ctx.centralSyncManager.addIncomingChanges(sessionId, batch);
    }

    return {};
  }
}
