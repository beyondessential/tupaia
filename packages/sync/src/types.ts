import { type PublicSchemaRecordName } from '@tupaia/database';
import { type ValueOf } from '@tupaia/types';
import { SYNC_SESSION_DIRECTION } from './constants';

export type SyncSessionDirectionValues = ValueOf<typeof SYNC_SESSION_DIRECTION>;

export type ModelSanitizeArgs<T extends Record<string, any> = { [key: string]: any }> = T;

export interface SyncSnapshotData {
  id: string;
  [key: string]: unknown;
}

export interface SyncSnapshotAttributes {
  id: number;
  direction?: SyncSessionDirectionValues;
  recordType: PublicSchemaRecordName;
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
