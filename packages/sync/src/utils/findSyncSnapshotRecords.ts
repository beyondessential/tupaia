import { BaseDatabase, PublicSchemaRecordName } from '@tupaia/database';
import { camelcaseKeys } from '@tupaia/tsutils';

import type { SyncSessionDirectionValues, SyncSnapshotAttributes } from '../types';
import { getSnapshotTableName } from './manageSnapshotTable';

export const findSyncSnapshotRecords = async (
  database: BaseDatabase,
  sessionId: string,
  fromId = 0,
  limit = Number.MAX_SAFE_INTEGER,
  recordType?: PublicSchemaRecordName,
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
