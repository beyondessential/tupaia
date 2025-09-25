import { COLUMNS_EXCLUDED_FROM_SYNC } from '@tupaia/constants';
import { DatabaseModel } from '@tupaia/database';

import { SyncSnapshotData } from '../types';

const EXCLUDED_PROPERTIES = ['model', ...COLUMNS_EXCLUDED_FROM_SYNC];

export const sanitizeRecord = (record: DatabaseModel): SyncSnapshotData =>
  Object.fromEntries(
    Object.entries(record)
      // don't sync metadata columns like updatedAt
      .filter(([c]) => !EXCLUDED_PROPERTIES.includes(c)),
  ) as SyncSnapshotData;
