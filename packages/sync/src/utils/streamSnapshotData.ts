import { TupaiaDatabase } from '@tupaia/database';
import { Response } from 'express';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';

import { getSnapshotTableName, getSnapshotTableCursorName } from './manageSnapshotTable';
import type { SyncSessionDirectionValues } from '../types';
import { getDependencyOrder } from './getDependencyOrder';

const asyncPipeline = promisify(pipeline);

async function* streamSnapshotCursor(database: TupaiaDatabase, cursorName: string, fetchSize: number) {
  try {
    while (true) {
      const rows: any = await database.executeSql(`FETCH FORWARD ${fetchSize} FROM ${cursorName}`);
      if (rows.length === 0) break;

      for (const row of rows) {
        yield JSON.stringify(row) + '\n';
      }
    }
  } finally {
    // Make sure to close the cursor no matter what
    await database.executeSql(`CLOSE ${cursorName}`);
    await database.executeSql(`COMMIT`);
  }
}

export const streamSnapshotData = async (
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
      SELECT s.id, s.record_type, s.data FROM ${tableName} s
      LEFT JOIN priority p ON s.record_type = p.record_type
      WHERE direction = :direction
      ORDER BY p.sort_order NULLS LAST;
    `,
    {
      direction,
    },
  );

  const fetchSize = 10000;

  try {
    await asyncPipeline(
      Readable.from(streamSnapshotCursor(database, cursorName, fetchSize)),
      res,
    );
  } catch (error) {
    console.error('Streaming failed:', error);
    res.status(500).end('Internal Server Error');
    try {
      await database.executeSql(`ROLLBACK`);
    } catch (e) {
      console.error('Failed to rollback after stream error:', e);
    }
  }
};
