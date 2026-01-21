import log from 'winston';

import { SYNC_STREAM_MESSAGE_KIND, SyncTickFlags } from '@tupaia/constants';
import { SyncSnapshotAttributes } from '@tupaia/sync';

import { stream } from '../api';
import { DatatrakWebModelRegistry, ProcessStreamDataParams } from '../types';

export const initiatePull = async (
  sessionId: string,
  since: number,
  projectIds: string[],
  deviceId: string,
) => {
  log.debug('ClientSyncManager.pull.waitingForCentral');
  const body = { since, projectIds, deviceId };

  for await (const { kind, message } of stream(() => ({
    method: 'POST',
    endpoint: `sync/${sessionId}/pull`,
    options: body,
  }))) {
    handler: switch (kind) {
      case SYNC_STREAM_MESSAGE_KIND.PULL_WAITING:
        // still waiting
        break handler;
      case SYNC_STREAM_MESSAGE_KIND.END:
        // Check for errors in the END message
        if (message?.error) {
          throw new Error(message.error);
        }
        // message includes pullUntil
        return { ...message };
      default:
        log.warn(`Unexpected message kind: ${kind}`);
    }
  }
  throw new Error('Unexpected end of stream');
};

export const pullIncomingChanges = async (
  models: DatatrakWebModelRegistry,
  sessionId: string,
  batchSize: number,
  processStreamedDataFunction: (params: ProcessStreamDataParams) => Promise<void>,
) => {
  let records: SyncSnapshotAttributes[] = [];

  stream: for await (const { kind, message } of stream(() => ({
    endpoint: `sync/${sessionId}/pull`,
  }))) {
    if (records.length >= batchSize) {
      // Process batch sequentially to maintain foreign key order
      await processStreamedDataFunction({ models, sessionId, records });
      records = [];
    }

    handler: switch (kind) {
      case SYNC_STREAM_MESSAGE_KIND.PULL_CHANGE:
        records.push({
          ...message,
          data: {
            ...message.data,
            updated_at_sync_tick: SyncTickFlags.INCOMING_FROM_CENTRAL_SERVER,
          },
        });
        break handler;
      case SYNC_STREAM_MESSAGE_KIND.END:
        // Check for errors in the END message
        if (message?.error) {
          throw new Error(message.error);
        }
        log.debug(`ClientSyncManager.pull.noMoreChanges`);
        break stream;
      default:
        log.warn('ClientSyncManager.pull.unknownMessageKind', { kind });
    }
  }

  // Process any remaining records
  if (records.length > 0) {
    await processStreamedDataFunction({ models, sessionId, records });
  }
};
