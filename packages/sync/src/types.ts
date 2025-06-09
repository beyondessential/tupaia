import { SyncDirections } from '@tupaia/constants';
import type { ModelRegistry } from '@tupaia/database';

import { SYNC_SESSION_DIRECTION } from './constants';

export type SyncDirectionValues = (typeof SyncDirections)[keyof typeof SyncDirections];

export type SyncSessionDirectionValues =
  (typeof SYNC_SESSION_DIRECTION)[keyof typeof SYNC_SESSION_DIRECTION];

export type FilteredModelRegistry = Partial<ModelRegistry>;

export type ModelSanitizeArgs<T extends Record<string, any> = { [key: string]: any }> = T;

export type RecordType = string;

export interface SyncSnapshotData {
  id: number;
  [key: string]: any;
}

export interface SyncSnapshotAttributes {
  id: number;
  direction: string;
  recordType: string;
  recordId: string;
  isDeleted: boolean;
  data: SyncSnapshotData;
  savedAtSyncTick: number;
  updatedAtByFieldSum?: number; // only for merged records
  syncLookupId?: number; // no syncLookupId if it is an incoming record
  requiresRepull?: boolean;
}

export type UninsertedSyncSnapshotAttributes = Omit<
  SyncSnapshotAttributes,
  'id' | 'savedAtSyncTick'
>;
