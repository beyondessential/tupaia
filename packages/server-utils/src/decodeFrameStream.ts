import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

// +---------+---------+---------+----------------+
// |  CR+LF  |   kind  |  length |     data...    |
// +---------+---------+---------+----------------+
// | 2 bytes | 2 bytes | 4 bytes | $length$ bytes |
// +---------+---------+---------+----------------+
//
// This is the server-side counterpart to the browser decoder in
// datatrak-web/src/api/stream.ts: it decodes the Tamanu Streaming Protocol framing off an
// incoming request body (a readable stream of Buffer/Uint8Array chunks), yielding one decoded
// message per complete frame. It mirrors StreamMessage.shape() on the encode side.

export interface DecodedFrame {
  kind: number;
  message: unknown;
}

interface DecodeFrameStreamOptions {
  decodeMessage?: boolean;
}

/**
 * Decode a framed request body incrementally, without buffering the whole body in memory.
 *
 * The transport gives no guarantee that a frame arrives in a single chunk: chunks may fragment a
 * frame or coalesce several together, so we accumulate bytes and only emit a frame once all of its
 * bytes have arrived. Decoding stops after an `END` frame is yielded.
 */
export async function* decodeFrameStream(
  source: AsyncIterable<Buffer | Uint8Array>,
  { decodeMessage = true }: DecodeFrameStreamOptions = {},
): AsyncGenerator<DecodedFrame, void, unknown> {
  let buffer = Buffer.alloc(0);

  const decodeOne = (): DecodedFrame | undefined => {
    if (buffer.length < 8) {
      return undefined;
    }

    // skip the first two bytes (CR+LF); they are reserved and not checked on decode
    const kind = buffer.readUInt16BE(2);
    const length = buffer.readUInt32BE(4);

    if (buffer.length < 8 + length) {
      // the full payload has not arrived yet, wait for more bytes
      return undefined;
    }

    const data = buffer.subarray(8, 8 + length);
    buffer = buffer.subarray(8 + length);

    if (decodeMessage) {
      // an empty payload is treated as an empty object, matching the browser decoder
      const message = length > 0 ? JSON.parse(data.toString('utf8')) : {};
      return { kind, message };
    }

    return { kind, message: data };
  };

  for await (const chunk of source) {
    buffer = Buffer.concat([buffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);

    while (true) {
      const frame = decodeOne();
      if (!frame) {
        break;
      }
      yield frame;
      if (frame.kind === SYNC_STREAM_MESSAGE_KIND.END) {
        return;
      }
    }
  }

  // the stream is done; flush any remaining complete frames still sitting in the buffer
  while (true) {
    const frame = decodeOne();
    if (!frame) {
      break;
    }
    yield frame;
    if (frame.kind === SYNC_STREAM_MESSAGE_KIND.END) {
      return;
    }
  }
}
