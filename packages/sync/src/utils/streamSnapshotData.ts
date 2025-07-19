import { Response } from 'express';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';

import { TupaiaDatabase } from '@tupaia/database';

import { getSnapshotTableName, getSnapshotTableCursorName } from './manageSnapshotTable';
import type { SyncSessionDirectionValues } from '../types';
import { getDependencyOrder } from './getDependencyOrder';
import { camelKeys } from '@tupaia/utils';

const asyncPipeline = promisify(pipeline);

// TODO: Move this to a config model RN-1668
const FETCH_SIZE = 10000;

async function* streamSnapshotCursor(database: TupaiaDatabase, cursorName: string) {
  while (true) {
    const rows: any = await database.executeSql(`FETCH FORWARD ${FETCH_SIZE} FROM ${cursorName};`);

    if (rows.length === 0) break;

    for (const row of rows) {
      yield JSON.stringify(camelKeys(row)) + '\n';
    }
  }
}

export const streamSnapshotData = async (
  res: Response,
  database: TupaiaDatabase,
  sessionId: string,
  direction: SyncSessionDirectionValues,
) => {
  const dependencyOrder = ['tombstone', ...(await getDependencyOrder(database))];
  const tableName = getSnapshotTableName(sessionId);
  const cursorName = getSnapshotTableCursorName(sessionId);
  const valuesSQL = dependencyOrder.map((name, index) => `('${name}', ${index + 1})`).join(',\n');

  await database.wrapInTransaction(async transactingDatabase => {
    try {
      await transactingDatabase.executeSql(
        `
          DECLARE ${cursorName} CURSOR WITH HOLD FOR
          WITH priority(record_type, sort_order) AS (
            VALUES
              ${valuesSQL}
          )
          SELECT s.id, s.record_type, s.is_deleted, s.data 
          FROM ${tableName} s
          LEFT JOIN priority p ON s.record_type = p.record_type
          WHERE direction = :direction
          ORDER BY p.sort_order NULLS LAST;
        `,
        {
          direction,
        },
      );

      await asyncPipeline(
        Readable.from(streamSnapshotCursor(transactingDatabase, cursorName)),
        res,
      );
    } finally {
      await transactingDatabase.executeSql(`CLOSE ${cursorName}`);
    }
  });
};
