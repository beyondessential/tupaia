import { SyncSnapshotAttributes } from '@tupaia/sync';
import { ValueOf } from '@tupaia/types';
import { SyncStage } from '../sync/ClientSyncManager';
import { DatatrakWebModelRegistry } from './model';

export interface ProcessStreamDataParams {
  models: DatatrakWebModelRegistry;
  sessionId: string;
  records: SyncSnapshotAttributes[];
}

export const SYNC_EVENT_ACTIONS = {
  SYNC_REQUESTING: 'syncInitialising',
  SYNC_IN_QUEUE: 'syncInQueue',
  SYNC_STARTED: 'syncStarted',
  SYNC_PROGRESS_CHANGED: 'syncProgress',
  SYNC_STAGE_CHANGED: 'syncStateChange',
  SYNC_STATUS_CHANGED: 'syncStatusChange',
  SYNC_ENDED: 'syncEnded',
  SYNC_ERROR: 'syncError',
} as const;

export const SYNC_STATUS = {
  ERROR: 'error',
  IDLE: 'idle',
  INACTIVE: 'inactive',
  QUEUING: 'queuing',
  REQUESTING: 'requesting',
  SYNCING: 'syncing',
} as const;

export type SyncStatus = ValueOf<typeof SYNC_STATUS>;

export type SyncEvents = {
  [SYNC_EVENT_ACTIONS.SYNC_REQUESTING]: undefined;
  [SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE]: undefined;
  [SYNC_EVENT_ACTIONS.SYNC_STARTED]: undefined;
  [SYNC_EVENT_ACTIONS.SYNC_PROGRESS_CHANGED]: {
    progress: number;
    message: string | null;
  };
  [SYNC_EVENT_ACTIONS.SYNC_STAGE_CHANGED]: { syncStage: SyncStage | null };
  [SYNC_EVENT_ACTIONS.SYNC_STATUS_CHANGED]: { status: SyncStatus };
  [SYNC_EVENT_ACTIONS.SYNC_ENDED]: undefined;
  [SYNC_EVENT_ACTIONS.SYNC_ERROR]: { error: string };
};
