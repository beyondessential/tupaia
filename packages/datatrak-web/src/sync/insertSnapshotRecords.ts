import { snake } from 'case';
import { DatatrakDatabase } from '../database/DatatrakDatabase';

const snakeKey = (obj: object) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [snake(key), value]));

export const insertSnapshotRecords = async (
  database: DatatrakDatabase,
  sessionId: string,
  records: object[],
) => {
  const sanitizedRecords = records
    .map(r => snakeKey(r));
  await database.createMany(sessionId, sanitizedRecords, 'sync_snapshots');
};
