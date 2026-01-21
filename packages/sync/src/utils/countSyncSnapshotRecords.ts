import { type Knex } from 'knex';

import { DatabaseRecordName, TupaiaDatabase } from '@tupaia/database';
import { SyncSessionDirectionValues } from '../types';
import { getSnapshotTableName } from './manageSnapshotTable';

export const countSyncSnapshotRecords = async (
  database: TupaiaDatabase,
  sessionId: string,
  direction?: SyncSessionDirectionValues,
  recordType?: DatabaseRecordName,
  additionalWhere?: string,
  parameters?: Knex.ValueDict,
): Promise<number> => {
  const tableName = getSnapshotTableName(sessionId);

  const [{ total }] = (await database.executeSql(
    `
      SELECT count(*)::int AS total FROM ${tableName}
      WHERE true
      ${direction ? 'AND direction = :direction' : ''}
      ${recordType ? 'AND record_type = :recordType' : ''}
      ${additionalWhere ? `AND ${additionalWhere}` : ''}
    `,
    {
      recordType,
      direction,
      ...parameters,
    },
  )) as { total?: number }[];
  return total || 0;
};
