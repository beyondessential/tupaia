import { DatabaseRecordName, TupaiaDatabase } from '@tupaia/database';
import { SyncSessionDirectionValues } from '../types';
import { getSnapshotTableName } from './manageSnapshotTable';

export const countSyncSnapshotRecords = async (
  database: TupaiaDatabase,
  sessionId: string,
  direction: SyncSessionDirectionValues,
  recordType?: DatabaseRecordName,
): Promise<number> => {
  const tableName = getSnapshotTableName(sessionId);

  const [{ total }] = await database.executeSql<[{ total?: number }]>(
    `
      SELECT count(*)::int AS total FROM ${tableName}
      WHERE direction = :direction
      ${recordType ? 'AND record_type = :recordType' : ''};
    `,
    {
      recordType,
      direction,
    },
  );
  return total || 0;
};
