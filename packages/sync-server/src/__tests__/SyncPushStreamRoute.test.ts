import { Readable } from 'stream';
import { StreamMessage } from '@tupaia/server-utils';

import { SyncPushStreamRoute } from '../routes/SyncPushStreamRoute';

// Builds a fake express request that is also a readable stream of framed bytes, matching what the
// route reads off the wire once bodyParser.json has (correctly) skipped the `application/json+frame`
// body. Each change becomes a PUSH_CHANGE frame; an END frame terminates unless withEnd is false.
const buildRequest = (
  changes: unknown[],
  { sessionId = 'session-1', withEnd = true, addIncomingChanges = jest.fn() } = {},
) => {
  const frames = changes.map(change => StreamMessage.pushChange(change));
  if (withEnd) {
    frames.push(StreamMessage.end());
  }
  const req = Readable.from(frames) as any;
  req.params = { sessionId };
  req.ctx = { centralSyncManager: { addIncomingChanges } };
  return { req, addIncomingChanges };
};

const runRoute = async (req: any) => {
  const route = new SyncPushStreamRoute(req, {} as any, jest.fn());
  return route.buildResponse();
};

describe('SyncPushStreamRoute', () => {
  it('decodes framed changes and stages them via addIncomingChanges', async () => {
    const changes = [
      { recordType: 'user_account', recordId: 'a', data: { first_name: 'Ada' } },
      { recordType: 'user_account', recordId: 'b', data: { first_name: 'Grace' } },
    ];
    const { req, addIncomingChanges } = buildRequest(changes);

    const response = await runRoute(req);

    expect(response).toEqual({});
    expect(addIncomingChanges).toHaveBeenCalledTimes(1);
    expect(addIncomingChanges).toHaveBeenCalledWith('session-1', changes);
  });

  it('stages changes in batches without buffering the whole push', async () => {
    const changes = Array.from({ length: 1500 }, (_, i) => ({
      recordType: 'survey_response',
      recordId: `id-${i}`,
      data: { value: i },
    }));
    const { req, addIncomingChanges } = buildRequest(changes);

    await runRoute(req);

    // BATCH_SIZE is 1000, so 1500 records are staged as a full batch then a remainder
    expect(addIncomingChanges).toHaveBeenCalledTimes(2);
    expect(addIncomingChanges.mock.calls[0][1]).toHaveLength(1000);
    expect(addIncomingChanges.mock.calls[1][1]).toHaveLength(500);
  });

  it('throws when the stream ends without an END frame (truncated push)', async () => {
    const change = { recordType: 'user_account', recordId: 'a', data: { first_name: 'Ada' } };
    const { req, addIncomingChanges } = buildRequest([change], { withEnd: false });

    await expect(runRoute(req)).rejects.toThrow('END frame');
    // The trailing batch must NOT be staged for an incomplete stream, so a truncated push is never
    // half-persisted; the caller retries from a fresh session.
    expect(addIncomingChanges).not.toHaveBeenCalled();
  });

  it('throws on a malformed PUSH_CHANGE frame rather than staging it', async () => {
    // Missing recordType/data: not a valid change shape, so it must be rejected before casting.
    const { req, addIncomingChanges } = buildRequest([{ recordId: 'a' }]);

    await expect(runRoute(req)).rejects.toThrow('malformed PUSH_CHANGE');
    expect(addIncomingChanges).not.toHaveBeenCalled();
  });
});
