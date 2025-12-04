import { Response } from 'express';

import { TupaiaDatabase } from '@tupaia/database';
import {
  getSnapshotTableName,
  getSnapshotTableCursorName,
  getDependencyOrder,
  SyncSessionDirectionValues,
} from '@tupaia/sync';
import { StreamMessage } from '@tupaia/server-utils';
import { camelKeys } from '@tupaia/utils';

// TODO: Move this to a config model RN-1668
const FETCH_SIZE = 10000;

async function streamSnapshotCursor(res: Response, database: TupaiaDatabase, cursorName: string) {
  while (true) {
    const rows: any = await database.executeSql(`FETCH FORWARD ${FETCH_SIZE} FROM ${cursorName};`);

    if (rows.length === 0) break;

    for (const row of rows) {
      res.write(StreamMessage.pullChange(camelKeys(row)));
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

      await streamSnapshotCursor(res, transactingDatabase, cursorName);
      res.write(StreamMessage.end());
      res.end();
    } finally {
      await transactingDatabase.executeSql(`CLOSE ${cursorName}`);
    }
  });
};
