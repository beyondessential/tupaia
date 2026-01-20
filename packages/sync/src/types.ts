import { SyncDirections } from '@tupaia/constants';

import { SYNC_SESSION_DIRECTION } from './constants';

export type SyncDirectionValues = (typeof SyncDirections)[keyof typeof SyncDirections];

export type SyncSessionDirectionValues =
  (typeof SYNC_SESSION_DIRECTION)[keyof typeof SYNC_SESSION_DIRECTION];

export type ModelSanitizeArgs<T extends Record<string, any> = { [key: string]: any }> = T;

export type RecordType = string;

export interface SyncSnapshotData {
  id: number;
  [key: string]: unknown;
}

export interface SyncSnapshotAttributes {
  id: number;
  direction: string;
  recordType: string;
  recordId: string;
  isDeleted: boolean;
  data: SyncSnapshotData;
  savedAtSyncTick: number;
  syncLookupId?: number; // no syncLookupId if it is an incoming record
  requiresRepull?: boolean;
}

export type UninsertedSyncSnapshotAttributes = Omit<
  SyncSnapshotAttributes,
  'id' | 'savedAtSyncTick'
>;
