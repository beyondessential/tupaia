import { ModelRegistry } from '@tupaia/database';
import { SyncSnapshotAttributes } from '@tupaia/sync';

import { post, stream } from '../api';
import { ProcessStreamDataParams } from './types';

export const initiatePull = async (
  sessionId: string,
  since: number,
  projectIds: string[],
  deviceId: string,
) => {
  console.log('ClientSyncManager.pull.waitingForCentral');
  const body = { since, projectIds, deviceId };
  return post(`sync/${sessionId}/pull`, { data: body });
};

export const pullIncomingChanges = async (
  models: ModelRegistry,
  sessionId: string,
  processStreamedDataFunction: (params: ProcessStreamDataParams) => Promise<void>,
) => {
  const reader = await stream(`sync/${sessionId}/pull`);
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    const batch = decoder.decode(value, { stream: true });
    buffer += batch;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    const records: SyncSnapshotAttributes[] = [];

    for (const line of lines) {
      try {
        const record = JSON.parse(line) as SyncSnapshotAttributes;
        // mark updatedAtSyncTick as never updated, so we don't push it back
        // to the central server until the next local update
        records.push({ ...record, data: { ...record.data, updatedAtSyncTick: -1 } });
      } catch (e) {
        console.error('Failed to parse JSON when streaming incoming changes for pull:', e, line);
      }
    }

    await processStreamedDataFunction({ models, sessionId, records });

    if (done) {
      break;
    }
  }
};
