import { type Knex } from 'knex';

import { PublicSchemaRecordName, TupaiaDatabase } from '@tupaia/database';
import { SyncSessionDirectionValues } from '../types';
import { getSnapshotTableName } from './manageSnapshotTable';

export const countSyncSnapshotRecords = async (
  database: TupaiaDatabase,
  sessionId: string,
  direction?: SyncSessionDirectionValues,
  recordType?: PublicSchemaRecordName,
  additionalWhere?: string,
  parameters?: Knex.ValueDict,
): Promise<number> => {
  const tableName = getSnapshotTableName(sessionId);

  const [{ total }] = await database.executeSql<[{ total?: number }]>(
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
  );
  return total || 0;
};

export const hasSyncSnapshotRecords = async (
  database: TupaiaDatabase,
  sessionId: string,
  direction?: SyncSessionDirectionValues,
  recordType?: PublicSchemaRecordName,
  additionalWhere?: string,
  parameters?: Knex.ValueDict,
): Promise<boolean> => {
  const tableName = getSnapshotTableName(sessionId);
  const [{ exists }] = await database.executeSql<[{ exists: boolean }]>(
    `
      SELECT EXISTS (
        SELECT 1 FROM ${tableName}
        WHERE true
        ${direction ? 'AND direction = :direction' : ''}
        ${recordType ? 'AND record_type = :recordType' : ''}
        ${additionalWhere ? `AND ${additionalWhere}` : ''}
      )
    `,
    { recordType, direction, ...parameters },
  );
  return exists;
};
