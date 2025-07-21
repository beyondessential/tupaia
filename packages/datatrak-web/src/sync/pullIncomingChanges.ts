import { ModelRegistry } from '@tupaia/database';
import { SyncSnapshotAttributes } from '@tupaia/sync';

import { stream } from '../api';
import { ProcessStreamDataParams } from '../types';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

export const initiatePull = async (
  sessionId: string,
  since: number,
  projectIds: string[],
  deviceId: string,
) => {
  console.log('ClientSyncManager.pull.waitingForCentral');
  const body = { since, projectIds, deviceId };

  for await (const { kind, message } of stream(() => ({
    endpoint: `sync/${sessionId}/pull`,
    options: body,
  }))) {
    handler: switch (kind) {
      case SYNC_STREAM_MESSAGE_KIND.PULL_WAITING:
        // still waiting
        break handler;
      case SYNC_STREAM_MESSAGE_KIND.END:
        // includes the new tick from starting the session
        return { ...message };
      default:
        console.warn(`Unexpected message kind: ${kind}`);
    }
  }
  throw new Error('Unexpected end of stream');
};

export const pullIncomingChanges = async (
  models: ModelRegistry,
  sessionId: string,
  processStreamedDataFunction: (params: ProcessStreamDataParams) => Promise<void>,
) => {
  stream: for await (const { kind, message } of stream(() => ({
    endpoint: `sync/${sessionId}/pull/stream`,
  }))) {
    // if (records.length >= WRITE_BATCH_SIZE) {
    //   // do writes in the background while we're continuing to stream data
    //   writes.push(writeBatch(records));
    //   records = [];
    // }

    handler: switch (kind) {
      case SYNC_STREAM_MESSAGE_KIND.PULL_CHANGE:
        const records: SyncSnapshotAttributes[] = message;
        await processStreamedDataFunction({ models, sessionId, records });
        break handler;
      case SYNC_STREAM_MESSAGE_KIND.END:
        console.debug(`FacilitySyncManager.pull.noMoreChanges`);
        break stream;
      default:
        console.warn('FacilitySyncManager.pull.unknownMessageKind', { kind });
    }
  }
};
