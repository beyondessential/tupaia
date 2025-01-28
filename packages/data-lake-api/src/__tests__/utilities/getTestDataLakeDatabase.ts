import { requireEnv, getEnvVarOrDefault } from '@tupaia/utils';
import { DataLakeDatabase } from '../../DataLakeDatabase';
import { getConnectionConfig } from '../../getConnectionConfig';

let readDatabase: DataLakeDatabase | null = null;
let writeDatabase: DataLakeDatabase | null = null;

export function getTestDatabase() {
  if (!readDatabase) {
    readDatabase = new DataLakeDatabase(getConnectionConfig());
  }
  return readDatabase;
}

export function getTestWriteDatabase() {
  if (!writeDatabase) {
    writeDatabase = new DataLakeDatabase(getWriteConnectionConfig());
  }
  return writeDatabase;
}

const getWriteConnectionConfig = () => ({
  host: requireEnv('DATA_LAKE_DB_URL'),
  port: getEnvVarOrDefault('DATA_LAKE_DB_PORT', 5432),
  user: requireEnv('DB_PG_USER'),
  password: requireEnv('DB_PG_PASSWORD'),
  database: requireEnv('DATA_LAKE_DB_NAME'),
  ssl:
    process.env.DB_ENABLE_SSL === 'true'
      ? {
          // Test server cannot turn on ssl, so sets the env to disable it
          rejectUnauthorized: false,
        }
      : null,
});
