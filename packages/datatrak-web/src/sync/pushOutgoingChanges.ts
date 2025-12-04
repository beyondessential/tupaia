import log from 'winston';
import { SyncSnapshotAttributes } from '@tupaia/sync';
import { post, stream } from '../api';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

// TODO: Move to config model RN-1668
const LIMIT = 10000;

export const pushOutgoingChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
  deviceId: string,
  progressCallback: (total: number, progressCount: number) => void,
): Promise<void> => {
  let startOfPage = 0;
  while (startOfPage < changes.length) {
    const endOfPage = Math.min(startOfPage + LIMIT, changes.length);
    const page = changes.slice(startOfPage, endOfPage);

    await post(`sync/${sessionId}/push`, { data: { changes: page } });

    progressCallback(changes.length, endOfPage);

    startOfPage = endOfPage;
  }

  for await (const { kind } of stream(() => ({
    method: 'PUT',
    endpoint: `sync/${sessionId}/push/complete`,
    options: { deviceId },
  }))) {
    handler: switch (kind) {
      case SYNC_STREAM_MESSAGE_KIND.PUSH_WAITING:
        // still waiting
        break handler;
      case SYNC_STREAM_MESSAGE_KIND.END:
        return;
      default:
        log.warn(`Unexpected message kind: ${kind}`);
    }
  }
};
