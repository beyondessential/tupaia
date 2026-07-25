import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { SyncServerPushRequest } from '@tupaia/types';
import { SyncSnapshotAttributes } from '@tupaia/sync';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';
import { decodeFrameStream } from '@tupaia/server-utils';

// Stage decoded changes into the session snapshot in batches, so we never hold the whole push in
// memory and each batch is validated + inserted as it arrives.
const BATCH_SIZE = 1000;

// Reuses the buffered push request type: the params (sessionId) are identical, and the framed body
// is read directly off the request stream rather than through `req.body`.
export type SyncPushStreamRequest = Request<
  SyncServerPushRequest.Params,
  SyncServerPushRequest.ResBody,
  SyncServerPushRequest.ReqBody,
  SyncServerPushRequest.ReqQuery
>;

export class SyncPushStreamRoute extends Route<SyncPushStreamRequest> {
  public async buildResponse() {
    const { ctx, params } = this.req;
    const { sessionId } = params;

    let batch: SyncSnapshotAttributes[] = [];
    let sawEnd = false;

    // The global bodyParser.json is a no-op for `application/json+frame`, so the request body is
    // still an unconsumed readable stream we can decode incrementally.
    for await (const { kind, message } of decodeFrameStream(this.req)) {
      switch (kind) {
        case SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE:
          batch.push(message as SyncSnapshotAttributes);
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

    if (batch.length > 0) {
      await ctx.centralSyncManager.addIncomingChanges(sessionId, batch);
    }

    // A body that ends without an END frame is a truncated/dropped push and must not be treated as
    // complete, so the client can retry from a fresh session.
    if (!sawEnd) {
      throw new Error('Sync push stream ended without an END frame');
    }

    return {};
  }
}
