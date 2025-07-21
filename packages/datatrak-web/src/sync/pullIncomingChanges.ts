import { ModelRegistry } from '@tupaia/database';
import { SyncSnapshotAttributes } from '@tupaia/sync';

import { ProcessStreamDataParams } from '../types';
import { CentralServerConnection } from './CentralServerConnection';

export const pullIncomingChanges = async (
  models: ModelRegistry,
  sessionId: string,
  connection: CentralServerConnection,
  processStreamedDataFunction: (params: ProcessStreamDataParams) => Promise<void>,
) => {
  const reader = await connection.pull(sessionId);
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
        records.push({ ...record, data: { ...record.data, updated_at_sync_tick: -1 } });
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
