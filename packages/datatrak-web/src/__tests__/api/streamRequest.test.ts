import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

import { encodeFrame, supportsRequestStreams } from '../../api/streamRequest';

// Decode a single frame the same way the server does, to prove the client encoder produces the
// Tamanu Streaming Protocol wire format the server can read.
const decodeFrame = (buf: Uint8Array) => {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const kind = view.getUint16(2, false);
  const length = view.getUint32(4, false);
  const data = buf.subarray(8, 8 + length);
  const message = length > 0 ? JSON.parse(new TextDecoder().decode(data)) : {};
  return { crlf: [buf[0], buf[1]], kind, length, message };
};

describe('encodeFrame', () => {
  it('encodes a PUSH_CHANGE frame in the [CR+LF][kind][length][json] wire format', () => {
    const change = { recordType: 'user_account', recordId: 'a', data: { first_name: 'Ada' } };
    const frame = encodeFrame(SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE, change);

    const expectedPayload = new TextEncoder().encode(JSON.stringify(change));
    const decoded = decodeFrame(frame);

    expect(decoded.crlf).toEqual([0x0d, 0x0a]); // CR LF
    expect(decoded.kind).toBe(SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE);
    expect(decoded.length).toBe(expectedPayload.length);
    expect(decoded.message).toEqual(change);
    expect(frame.length).toBe(expectedPayload.length + 8);
  });

  it('encodes an END frame with an empty payload', () => {
    const frame = encodeFrame(SYNC_STREAM_MESSAGE_KIND.END);
    const decoded = decodeFrame(frame);

    expect(decoded.kind).toBe(SYNC_STREAM_MESSAGE_KIND.END);
    expect(decoded.length).toBe(0);
    expect(frame.length).toBe(8);
  });

  it('round-trips a sequence of frames concatenated on the wire', () => {
    const changes = [{ recordId: 'a' }, { recordId: 'b' }];
    const frames = [
      ...changes.map(c => encodeFrame(SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE, c)),
      encodeFrame(SYNC_STREAM_MESSAGE_KIND.END),
    ];

    let offset = 0;
    const total = frames.reduce((sum, f) => sum + f.length, 0);
    const wire = new Uint8Array(total);
    for (const f of frames) {
      wire.set(f, offset);
      offset += f.length;
    }

    // walk the concatenated buffer frame by frame
    let cursor = 0;
    const decoded: ReturnType<typeof decodeFrame>[] = [];
    while (cursor < wire.length) {
      const view = new DataView(wire.buffer, cursor);
      const length = view.getUint32(4, false);
      decoded.push(decodeFrame(wire.subarray(cursor, cursor + 8 + length)));
      cursor += 8 + length;
    }

    expect(decoded.map(d => d.kind)).toEqual([
      SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE,
      SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE,
      SYNC_STREAM_MESSAGE_KIND.END,
    ]);
    expect(decoded[0].message).toEqual(changes[0]);
    expect(decoded[1].message).toEqual(changes[1]);
  });
});

describe('supportsRequestStreams', () => {
  it('returns a boolean and is stable across calls (feature-detect is memoised)', () => {
    const first = supportsRequestStreams();
    const second = supportsRequestStreams();
    expect(typeof first).toBe('boolean');
    expect(first).toBe(second);
  });
});
