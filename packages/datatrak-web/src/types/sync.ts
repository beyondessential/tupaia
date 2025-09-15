import { ModelRegistry } from '@tupaia/database';
import { SyncSnapshotAttributes } from '@tupaia/sync';

export interface ProcessStreamDataParams {
  models: ModelRegistry;
  sessionId: string;
  records: SyncSnapshotAttributes[];
}

export const SYNC_EVENT_ACTIONS = {
  SYNC_IN_QUEUE: 'syncInQueue',
  SYNC_STARTED: 'syncStarted',
  SYNC_STATE_CHANGED: 'syncStateChanged',
  SYNC_ENDED: 'syncEnded',
  SYNC_ERROR: 'syncError',
} as const;
