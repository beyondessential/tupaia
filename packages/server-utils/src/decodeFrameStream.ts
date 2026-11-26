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

// Upper bound on a single frame's declared payload length. The 4-byte length field can express up
// to ~4 GB, so without a cap a crafted header (e.g. length = 0xFFFFFFFF) would make the decoder
// buffer gigabytes waiting for bytes that never arrive, exhausting server memory. 100 MB is far
// larger than any legitimate single change (including a base64 photo) while bounding the blast
// radius of a malicious client.
export const MAX_FRAME_LENGTH = 100 * 1024 * 1024; // 100 MB

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
  // Accumulate arriving chunks in a list rather than `Buffer.concat`-ing onto a single growing
  // buffer on every chunk (which is O(n²) in the stream length — for a multi-MB frame fragmented
  // into ~1.4 KB TCP chunks that means thousands of full-buffer copies). Instead we track the total
  // buffered length and only flatten the chunks that span a boundary, once, when a frame is ready.
  let chunks: Buffer[] = [];
  let bufferedLength = 0;

  // Return a contiguous Buffer whose first `n` bytes are available, merging as few leading chunks
  // as necessary. Callers must only read the first `n` bytes of the result. Requires `n` bytes to
  // already be buffered.
  const merge = (n: number): Buffer => {
    if (chunks[0].length >= n) {
      return chunks[0];
    }
    const parts: Buffer[] = [];
    let accumulated = 0;
    let consumed = 0;
    while (accumulated < n) {
      parts.push(chunks[consumed]);
      accumulated += chunks[consumed].length;
      consumed += 1;
    }
    const merged = Buffer.concat(parts);
    chunks = [merged, ...chunks.slice(consumed)];
    return merged;
  };

  // Remove and return the first `n` buffered bytes as a contiguous Buffer, flattening only the
  // chunks that span the requested range. Requires `n` bytes to already be buffered.
  const take = (n: number): Buffer => {
    const merged = merge(n);
    const result = merged.subarray(0, n);
    const leftover = merged.subarray(n);
    chunks = leftover.length > 0 ? [leftover, ...chunks.slice(1)] : chunks.slice(1);
    bufferedLength -= n;
    return result;
  };

  const decodeOne = (): DecodedFrame | undefined => {
    if (bufferedLength < 8) {
      return undefined;
    }

    // read the 8-byte header (may span chunks); skip the first two bytes (CR+LF): they are
    // reserved and not checked on decode
    const header = merge(8);
    const kind = header.readUInt16BE(2);
    const length = header.readUInt32BE(4);

    if (length > MAX_FRAME_LENGTH) {
      throw new Error(
        `Sync push frame length ${length} exceeds the maximum of ${MAX_FRAME_LENGTH} bytes`,
      );
    }

    if (bufferedLength < 8 + length) {
      // the full payload has not arrived yet, wait for more bytes
      return undefined;
    }

    const frame = take(8 + length);
    const data = frame.subarray(8, 8 + length);

    if (decodeMessage) {
      // an empty payload is treated as an empty object, matching the browser decoder
      const message = length > 0 ? JSON.parse(data.toString('utf8')) : {};
      return { kind, message };
    }

    return { kind, message: data };
  };

  for await (const chunk of source) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    if (buffer.length === 0) {
      continue;
    }
    chunks.push(buffer);
    bufferedLength += buffer.length;

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
