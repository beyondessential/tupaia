import { camelcaseKeys } from '@tupaia/tsutils';
import { BaseDatabase } from '@tupaia/database';

import { getSnapshotTableName } from './manageSnapshotTable';
import type { RecordType, SyncSessionDirectionValues, SyncSnapshotAttributes } from '../types';

export const findSyncSnapshotRecords = async (
  database: BaseDatabase,
  sessionId: string,
  fromId = 0,
  limit = Number.MAX_SAFE_INTEGER,
  recordType: RecordType,
  direction?: SyncSessionDirectionValues,
  additionalWhere?: string,
): Promise<SyncSnapshotAttributes[]> => {
  const tableName = getSnapshotTableName(sessionId);

  const records = (await database.executeSql(
    `
      SELECT * FROM ${tableName}
      WHERE id > :fromId
      ${direction ? 'AND direction = :direction' : ''}
      ${recordType ? 'AND record_type = :recordType' : ''}
      ${additionalWhere ? `AND ${additionalWhere}` : ''}
      ORDER BY id ASC
      LIMIT :limit;
    `,
    {
      fromId,
      recordType,
      direction,
      limit,
    },
  )) as SyncSnapshotAttributes[];

  return camelcaseKeys(records) as SyncSnapshotAttributes[];
};
