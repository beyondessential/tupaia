import { TupaiaDatabase } from '@tupaia/database';
import { Response } from 'express';

import { getSnapshotTableName, getSnapshotTableCursorName } from './manageSnapshotTable';
import type { SyncSessionDirectionValues } from '../types';
import { getDependencyOrder } from './getDependencyOrder';

export const findSyncSnapshotRecords = async (
  res: Response,
  database: TupaiaDatabase,
  sessionId: string,
  direction: SyncSessionDirectionValues,
) => {
  const dependencyOrder = await getDependencyOrder(database);
  const tableName = getSnapshotTableName(sessionId);
  const cursorName = getSnapshotTableCursorName(sessionId);
  const valuesSQL = dependencyOrder.map((name, index) => `('${name}', ${index + 1})`).join(',\n');

  await database.executeSql(`BEGIN`);
  await database.executeSql(
    `
      DECLARE ${cursorName} CURSOR FOR
      WITH priority(record_type, sort_order) AS (
        VALUES
          ${valuesSQL}
      )
      SELECT * FROM ${tableName} s
      LEFT JOIN priority p ON s.record_type = p.record_type
      WHERE direction = :direction
      ORDER BY p.sort_order NULLS LAST;
    `,
    {
      direction,
    },
  );

  const fetchSize = 14;
  let count = 0;
  while (true) {
    const rows: any = await database.executeSql(`FETCH FORWARD ${fetchSize} FROM ${cursorName}`);
    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      res.write(JSON.stringify(row) + '\n');
    }

    count += rows.length;

    // TODO: Remove test code
    // if (count > 100) {
    //   throw new Error('STOP THERE');
    // }
  }

  await database.executeSql(`CLOSE ${cursorName}`);
  await database.executeSql('COMMIT');
};
