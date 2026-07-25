import { Readable } from 'stream';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

import { decodeFrameStream } from '../decodeFrameStream';
import { StreamMessage } from '../StreamMessage';

const collect = async (source: AsyncIterable<Buffer | Uint8Array>) => {
  const frames = [];
  for await (const frame of decodeFrameStream(source)) {
    frames.push(frame);
  }
  return frames;
};

// Re-chunk a single buffer into fixed-size slices to simulate arbitrary transport fragmentation.
const rechunk = (buffer: Buffer, size: number) => {
  const chunks = [];
  for (let offset = 0; offset < buffer.length; offset += size) {
    chunks.push(buffer.subarray(offset, offset + size));
  }
  return chunks;
};

describe('decodeFrameStream', () => {
  it('decodes a sequence of PUSH_CHANGE frames terminated by END', async () => {
    const changes = [
      { recordType: 'user_account', recordId: 'a', data: { first_name: 'Ada' } },
      { recordType: 'user_account', recordId: 'b', data: { first_name: 'Grace' } },
    ];
    const source = Readable.from([
      StreamMessage.pushChange(changes[0]),
      StreamMessage.pushChange(changes[1]),
      StreamMessage.end(),
    ]);

    const frames = await collect(source);

    expect(frames).toEqual([
      { kind: SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE, message: changes[0] },
      { kind: SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE, message: changes[1] },
      { kind: SYNC_STREAM_MESSAGE_KIND.END, message: {} },
    ]);
  });

  it('reassembles frames fragmented across chunk boundaries', async () => {
    const changes = Array.from({ length: 5 }, (_, i) => ({
      recordType: 'survey_response',
      recordId: `id-${i}`,
      data: { value: 'x'.repeat(50) },
    }));
    const whole = Buffer.concat([
      ...changes.map(c => StreamMessage.pushChange(c)),
      StreamMessage.end(),
    ]);

    // 7 bytes is smaller than the 8-byte header, forcing headers and payloads to split across chunks
    const source = Readable.from(rechunk(whole, 7));

    const frames = await collect(source);

    expect(frames).toHaveLength(6);
    expect(frames.slice(0, 5).map(f => f.message)).toEqual(changes);
    expect(frames[5].kind).toBe(SYNC_STREAM_MESSAGE_KIND.END);
  });

  it('decodes multiple frames coalesced into a single chunk', async () => {
    const whole = Buffer.concat([
      StreamMessage.pushChange({ recordId: 'a' }),
      StreamMessage.pushChange({ recordId: 'b' }),
      StreamMessage.end(),
    ]);
    const source = Readable.from([whole]);

    const frames = await collect(source);

    expect(frames.map(f => f.kind)).toEqual([
      SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE,
      SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE,
      SYNC_STREAM_MESSAGE_KIND.END,
    ]);
  });

  it('stops decoding after the END frame even if trailing bytes follow', async () => {
    const source = Readable.from([
      StreamMessage.pushChange({ recordId: 'a' }),
      StreamMessage.end(),
      StreamMessage.pushChange({ recordId: 'should-be-ignored' }),
    ]);

    const frames = await collect(source);

    expect(frames).toHaveLength(2);
    expect(frames[1].kind).toBe(SYNC_STREAM_MESSAGE_KIND.END);
  });

  it('treats an empty payload as an empty object', async () => {
    const source = Readable.from([StreamMessage.pushChange(undefined), StreamMessage.end()]);

    const frames = await collect(source);

    expect(frames[0]).toEqual({ kind: SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE, message: {} });
  });
});
