import type { Response } from 'express';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

// +---------+---------+---------+----------------+
// |  CR+LF  |   kind  |  length |     data...    |
// +---------+---------+---------+----------------+
// | 2 bytes | 2 bytes | 4 bytes | $length$ bytes |
// +---------+---------+---------+----------------+
//
// See datatrak-web/src/api/stream.ts for the full description

export function startStream(res: Response) {
  res.writeHead(200, {
    'Content-Type': 'application/json+frame',
    'Transfer-Encoding': 'chunked',
  });
}

function shape(kind: number, data: unknown = undefined) {
  const dataBytes =
    data === undefined ? Buffer.alloc(0) : Buffer.from(JSON.stringify(data), 'utf8');
  const buf = Buffer.alloc(dataBytes.length + 8);
  buf.write('\r\n', 0);
  buf.writeUInt16BE(kind, 2);
  buf.writeUInt32BE(dataBytes.length, 4);
  dataBytes.copy(buf, 8);
  return buf;
}

export const StreamMessage = {
  sessionWaiting() {
    return shape(SYNC_STREAM_MESSAGE_KIND.SESSION_WAITING);
  },
  pullWaiting() {
    return shape(SYNC_STREAM_MESSAGE_KIND.PULL_WAITING);
  },
  pullChange(data: unknown) {
    return shape(SYNC_STREAM_MESSAGE_KIND.PULL_CHANGE, data);
  },
  pushWaiting() {
    return shape(SYNC_STREAM_MESSAGE_KIND.PUSH_WAITING);
  },
  end(data = {}) {
    return shape(SYNC_STREAM_MESSAGE_KIND.END, Object.entries(data).length > 0 ? data : undefined);
  },
};
