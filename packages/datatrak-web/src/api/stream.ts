import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';
import { API_URL } from './api';

interface EndpointOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  options?: Record<string, any>;
}

type EndpointFn = () => EndpointOptions;

interface StreamOptions {
  decodeMessage?: boolean;
  streamRetryAttempts?: number;
  streamRetryInterval?: number;
}

/** Connect to a streaming endpoint and async yield messages.
 *
 * ```js
 * for await (const { kind, message } of centralServer.stream(() => ({
 *   endpoint: `some/kind/of/stream`,
 * }))) {
 *   switch (kind) {
 *     case SYNC_STREAM_MESSAGE_KIND.SOMETHING:
 *       // do something
 *       break;
 *     case SYNC_STREAM_MESSAGE_KIND.END:
 *       // finalise
 *       break;
 *     default:
 *       console.warn(`Unknown message kind: ${kind}`);
 *   }
 * }
 * ```
 *
 * The streaming endpoint needs to talk the Tamanu Streaming Protocol: a lightweight framing
 * protocol which includes a 2-byte Message Kind (unsigned int) and an optional JSON payload.
 * The stream MUST end with an `END` Message Kind (which may have a payload): if the stream
 * does not receive an `END` message, it is assumed to be incomplete and is automatically
 * restarted; this protects against unexpected stream disconnections.
 *
 * There are two possible layers of retry logic: on connection, using the endpointFn `options`
 * map, you can set `backoff` to retry the fetch on initial failure. This applies on top of the
 * stream retries, controlled by `streamRetryAttempts` (default 10) and `streamRetryInterval`
 * (milliseconds, default 10 seconds), which will restart the entire stream if it fails early.
 * Set `streamRetryAttempts` to 1 to disable the retries.
 *
 * Because the entire stream is restarted during a stream retry, the endpoint is not a fixed URL
 * but instead a function which is expected to return an object: `{ endpoint, query, options }`.
 * The `endpoint` key is required, the others default to `{}` if not present. These are passed to
 * and interpreted the same as for `.fetch()` above.
 *
 * For example, you can track some progress information from the messages you receive, and then
 * provide a "start from this point" query parameter to the next retry call. This avoids either
 * receiving the full stream contents again or keeping track of stream session state server-side.
 *
 * Message payloads are expected to be JSON, and by default are parsed directly within this
 * function. If you expect non-JSON payloads, or if you want to obtain the raw payload for some
 * other reason, pass `decodeMessage: false`. This will be slightly faster as the framing allows
 * us to seek forward through the received data rather than read every byte.
 *
 * @param {EndpointFn} endpointFn
 * @param {StreamOptions} streamOptions
 * @returns
 */
export async function* stream(
  endpointFn: EndpointFn,
  {
    decodeMessage = true,
    streamRetryAttempts = 10,
    streamRetryInterval = 10000,
  }: StreamOptions = {},
) {
  // +---------+---------+---------+----------------+
  // |  CR+LF  |   kind  |  length |     data...    |
  // +---------+---------+---------+----------------+
  // | 2 bytes | 2 bytes | 4 bytes | $length$ bytes |
  // +---------+---------+---------+----------------+
  //
  // This framing makes it cheap to verify that all the data is here,
  // and also doesn't *require* us to parse any of the message data.
  // The first two bytes are a CR+LF (a newline), which makes it possible
  // to curl an endpoint and get (almost) newline-delimited JSON which
  // will print nicely in a terminal.
  const decodeOne = buffer => {
    if (buffer.length < 8) {
      return { buf: buffer };
    }

    // skip reading the first two bytes. we could check that they
    // are CR+LF but that's not really needed, and leaves us some
    // leeway later if we want to put more stuff in those bytes.
    const kind = buffer.readUInt16BE(2);
    const length = buffer.readUInt32BE(4);
    const data = buffer.subarray(8, 8 + length);

    if (data.length < length) {
      return { buf: buffer, kind };
    }

    // we've got the full message, move it out of buffer
    buffer = buffer.subarray(8 + length);

    console.debug('Stream: message', {
      // we try to show the actual name of the Kind when known instead of the raw value
      // we also display the raw value in hex as that's how they're defined in constants
      kind:
        Object.entries(SYNC_STREAM_MESSAGE_KIND).find(([, value]) => value === kind)?.[0] ??
        `0x${kind.toString(16)}`,
      length,
      data,
    });

    if (decodeMessage) {
      // message is assumed to be an empty object when length is zero,
      // such that it can generally be assumed that message is an object
      // (though that will depend on stream endpoint application)
      const message = length > 0 ? JSON.parse(data) : {};
      return { buf: buffer, length, kind, message };
    } else {
      return { buf: buffer, length, kind, message: data };
    }
  };

  let { method, endpoint, options } = endpointFn();
  for (let attempt = 1; attempt <= streamRetryAttempts; attempt++) {
    console.debug(`Stream: attempt ${attempt} of ${streamRetryAttempts} for ${endpoint}`);
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options ? JSON.stringify(options) : undefined,
      credentials: 'include',
    });

    const reader = response.body!.getReader();

    // buffer used to accumulate the data received from the stream.
    // it's important to remember that there's no guarantee that a
    // message sent from the server is received in one go by the
    // client: the transport could fragment messages at arbitrary
    // boundaries, or could concatenate messages together.
    let buffer = Buffer.alloc(0);
    reader: while (true) {
      const { done, value } = await reader.read();

      if (value) {
        buffer = Buffer.concat([buffer, value]);
      }

      // while not strictly required, for clarity we label both reader
      // and decoder loops and always use the right label to break out
      decoder: while (true) {
        const { buf, length, kind, message } = decodeOne(buffer);
        buffer = buf;
        if (length === undefined) {
          // not enough data, wait for more
          break decoder;
        }

        yield { kind, message };

        if (kind === SYNC_STREAM_MESSAGE_KIND.END) {
          return; // stop processing data
          // technically we could also abort the fetch at this point,
          // but for now let's assume stream endpoints are well-behaved
          // and are closing the stream immediately after sending END
        }
      }

      // when the stream is done we need to keep decoding what's in our buffer
      if (done) {
        const { length, kind, message } = decodeOne(buffer);

        if (!kind) {
          console.warn('Stream ended with incomplete data, will retry');
          break reader;
        }

        if (length === undefined && kind === SYNC_STREAM_MESSAGE_KIND.END) {
          // if the data is not complete, don't interpret the END message as being truly the end
          console.warn('END message received but with partial data, will retry');
          break reader;
        }

        yield { kind, message };

        if (kind === SYNC_STREAM_MESSAGE_KIND.END) {
          return; // skip retry logic
        }

        break reader;
      }
    }

    // this is sleepAsync but it's simple enough to implement ourselves
    // instead of adding a whole dependency on @tamanu/shared just for it
    await new Promise(resolve => {
      setTimeout(resolve, streamRetryInterval);
    });

    ({ endpoint, options } = endpointFn());
    if (!endpoint) {
      // expected to only be a developer error
      throw new Error(`Stream: endpoint became undefined`);
    }
  }

  // all "happy path" endings are explicit returns,
  // so if we fall through we are in the error path
  throw new Error(
    `Stream: did not get proper END after ${streamRetryAttempts} attempts for ${endpoint}`,
  );
}
