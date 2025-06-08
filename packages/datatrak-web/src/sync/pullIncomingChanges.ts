import { ModelRegistry } from '@tupaia/database';

import { post, stream } from '../api';
import { ProcessStreamDataParams } from './processStreamedData';

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
  const totalObjects: any[] = [];
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    const batch = decoder.decode(value, { stream: true });
    buffer += batch;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    const objects: any[] = [];

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        // mark updatedAtSyncTick as never updated, so we don't push it back to the central server until the next local update
        objects.push({ ...obj, data: { ...obj.data, updatedAtSyncTick: -1 } });
      } catch (e) {
        console.error('Failed to parse JSON:', e, line);
      }
    }

    await processStreamedDataFunction({ models, sessionId, objects, totalObjects });

    if (done) {
      break;
    }
  }

  return { totalObjects };
};
