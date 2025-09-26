import { TupaiaDatabase } from '@tupaia/database';
import { snakeKeys } from '@tupaia/utils';

const SCHEMA = 'sync_snapshots';

const assertSessionIdIsSafe = (sessionId: string) => {
  const safeIdRegex = /^[A-Za-z0-9-]{24}$/;
  if (!safeIdRegex.test(sessionId)) {
    throw new Error(
      `${sessionId} does not match the expected format of a session id - be careful of SQL injection!`,
    );
  }
};

// includes a safety check for using in raw sql rather than via sequelize query building
export const getSnapshotTableName = (sessionId: string) => {
  assertSessionIdIsSafe(sessionId);

  return `"${SCHEMA}"."${sessionId}"`;
};

export const getSnapshotTableCursorName = (sessionId: string) => {
  assertSessionIdIsSafe(sessionId);

  return `"${sessionId}_snapshot_cursor"`;
};

export const createSnapshotTable = async (database: TupaiaDatabase, sessionId: string) => {
  const tableName = getSnapshotTableName(sessionId);
  await database.executeSql(`
    CREATE TABLE ${tableName} (
      id BIGSERIAL PRIMARY KEY,
      direction TEXT NOT NULL,
      record_type TEXT NOT NULL,
      record_id TEXT NOT NULL,
      data json NOT NULL,
      saved_at_sync_tick BIGINT, -- saved_at_sync_tick is used to check whether record has been updated between incoming and outgoing phase of a single session
      sync_lookup_id BIGINT,
      requires_repull BOOLEAN DEFAULT false,
      is_deleted BOOLEAN DEFAULT false
    );
  `);

  await database.executeSql(`
    CREATE INDEX ${tableName
      .replaceAll('.', '_')
      .replaceAll('"', '')
      .replaceAll('-', '')}_direction_index ON ${tableName}(direction);
  `);
};

export const createClientSnapshotTable = async (database: TupaiaDatabase, sessionId: string) => {
  const tableName = getSnapshotTableName(sessionId);
  await database.executeSql(`
    CREATE TABLE ${tableName} (
      id BIGSERIAL PRIMARY KEY,
      record_type character varying(255) NOT NULL,
      is_deleted BOOLEAN DEFAULT false,
      data json NOT NULL
    ) WITH (
      autovacuum_enabled = off
    );
  `);
};

export const dropSnapshotTable = async (database: TupaiaDatabase, sessionId: string) => {
  const tableName = getSnapshotTableName(sessionId);
  await database.executeSql(`
    DROP TABLE IF EXISTS ${tableName};
  `);
};

export const dropAllSnapshotTables = async (database: TupaiaDatabase) => {
  await database.executeSql(`
    DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE;
  `);
  await database.executeSql(`
    CREATE SCHEMA ${SCHEMA};
  `);
};

export const insertSnapshotRecords = async (
  database: TupaiaDatabase,
  sessionId: string,
  records: object[],
) => {
  const sanitizedRecords = records
    .map(r => snakeKeys(r))
    .map(r => ({ ...r, data: JSON.stringify(r.data) }));
  await database.createMany(sessionId, sanitizedRecords, SCHEMA, { shouldGenerateId: false });
};

export const updateSnapshotRecords = async (
  database: TupaiaDatabase,
  sessionId: string,
  values: object,
  where: object,
) => {
  await database.update(sessionId, where, values, SCHEMA);
};
