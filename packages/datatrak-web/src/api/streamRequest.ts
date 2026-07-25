import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';
import { API_URL } from './api';

// +---------+---------+---------+----------------+
// |  CR+LF  |   kind  |  length |     data...    |
// +---------+---------+---------+----------------+
// | 2 bytes | 2 bytes | 4 bytes | $length$ bytes |
// +---------+---------+---------+----------------+
//
// This is the request-body (push) counterpart to the response decoder in stream.ts. It encodes the
// Tamanu Streaming Protocol framing so the client can stream changes up to the server frame by
// frame, instead of buffering a whole page into a single JSON body. It mirrors the server encoder
// in server-utils/src/StreamMessage.ts.

const textEncoder = new TextEncoder();

export function encodeFrame(kind: number, data?: unknown): Uint8Array {
  const dataBytes =
    data === undefined ? new Uint8Array(0) : textEncoder.encode(JSON.stringify(data));
  const buf = new Uint8Array(dataBytes.length + 8);
  const view = new DataView(buf.buffer);
  buf[0] = 0x0d; // \r
  buf[1] = 0x0a; // \n
  view.setUint16(2, kind, false); // big-endian
  view.setUint32(4, dataBytes.length, false); // big-endian
  buf.set(dataBytes, 8);
  return buf;
}

let requestStreamsSupported: boolean | undefined;

/**
 * Feature-detect whether the runtime supports streaming request bodies (a `ReadableStream` body
 * with `duplex: 'half'`). Chromium-based browsers over HTTP/2 support this; others do not. When it
 * is unsupported, callers fall back to the buffered push path so no browser regresses.
 *
 * @see https://developer.chrome.com/docs/capabilities/web-apis/fetch-streaming-requests
 */
export function supportsRequestStreams(): boolean {
  if (requestStreamsSupported !== undefined) {
    return requestStreamsSupported;
  }

  if (typeof ReadableStream === 'undefined' || typeof Request === 'undefined') {
    requestStreamsSupported = false;
    return requestStreamsSupported;
  }

  let duplexAccessed = false;
  try {
    const hasContentType = new Request('http://localhost', {
      body: new ReadableStream(),
      method: 'POST',
      // Accessing `duplex` proves the runtime read the option; if it never does, streaming request
      // bodies are not supported and the Request would have set a Content-Type from the body.
      get duplex() {
        duplexAccessed = true;
        return 'half';
      },
    } as RequestInit).headers.has('Content-Type');
    requestStreamsSupported = duplexAccessed && !hasContentType;
  } catch {
    requestStreamsSupported = false;
  }

  return requestStreamsSupported;
}

/**
 * Stream the given changes to the endpoint as a sequence of `PUSH_CHANGE` frames terminated by an
 * `END` frame, using a streaming request body so the whole payload is never buffered in memory or
 * measured against the request-body size cap.
 */
export async function pushChangesAsStream<T>(
  endpoint: string,
  changes: T[],
  onProgress?: (sent: number) => void,
): Promise<void> {
  let index = 0;

  const body = new ReadableStream<Uint8Array>({
    // Pull-based so we honour backpressure and only encode one frame at a time.
    pull(controller) {
      if (index < changes.length) {
        controller.enqueue(encodeFrame(SYNC_STREAM_MESSAGE_KIND.PUSH_CHANGE, changes[index]));
        index += 1;
        onProgress?.(index);
      } else {
        controller.enqueue(encodeFrame(SYNC_STREAM_MESSAGE_KIND.END));
        controller.close();
      }
    },
  });

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json+frame',
      'X-Client-Version': process.env.REACT_APP_VERSION || '',
    },
    body,
    credentials: 'include',
    // `duplex` is required by the fetch spec whenever the body is a stream; it is not yet in the
    // TypeScript DOM lib, hence the cast.
    duplex: 'half',
  } as RequestInit);

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data?.error || data?.message || message;
    } catch {
      // response was not JSON, keep the status text
    }
    throw new Error(message || 'Streaming push failed');
  }
}
