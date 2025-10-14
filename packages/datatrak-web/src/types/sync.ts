import { SyncSnapshotAttributes } from '@tupaia/sync';
import { DatatrakWebModelRegistry } from './model';

export interface ProcessStreamDataParams {
  models: DatatrakWebModelRegistry;
  sessionId: string;
  records: SyncSnapshotAttributes[];
}

export const SYNC_EVENT_ACTIONS = {
  SYNC_INITIALISING: 'syncInitialising',
  SYNC_IN_QUEUE: 'syncInQueue',
  SYNC_STARTED: 'syncStarted',
  SYNC_STATE_CHANGED: 'syncStateChanged',
  SYNC_ENDED: 'syncEnded',
  SYNC_ERROR: 'syncError',
} as const;
