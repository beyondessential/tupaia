import { snake } from 'case';
import { DatatrakDatabase } from '../database/DatatrakDatabase';

/*
 * Every record in a pull batch has the same keys, but `snake()` is regex-based and was being
 * called once per key per record — 90,000 calls for a 10,000-record batch instead of 9. This
 * runs on the main thread (only the SQL itself is in the PGlite worker), so it was ~140ms of
 * uninterruptible work per batch on a dev laptop, and enough to visibly block input and paint
 * on a low-spec device. Caching the key mapping makes it ~8x cheaper.
 */
const snakeCaseKeys = new Map<string, string>();

const toSnakeCase = (key: string) => {
  const cached = snakeCaseKeys.get(key);
  if (cached !== undefined) return cached;
  const snaked = snake(key);
  snakeCaseKeys.set(key, snaked);
  return snaked;
};

const snakeKey = (obj: object) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [toSnakeCase(key), value]));

export const insertSnapshotRecords = async (
  database: DatatrakDatabase,
  sessionId: string,
  records: object[],
) => {
  const sanitizedRecords = records.map(r => snakeKey(r));
  await database.createMany(sessionId, sanitizedRecords, 'sync_snapshots');
};
