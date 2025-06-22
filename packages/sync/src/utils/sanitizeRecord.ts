import { COLUMNS_EXCLUDED_FROM_SYNC } from '@tupaia/constants';
import { DatabaseModel } from '@tupaia/database';

import { SyncSnapshotData } from '../types';

export const sanitizeRecord = (record: DatabaseModel): SyncSnapshotData =>
  Object.fromEntries(
    Object.entries(record)
      // don't sync metadata columns like updatedAt
      .filter(([c]) => !COLUMNS_EXCLUDED_FROM_SYNC.includes(c)),
  ) as SyncSnapshotData;
