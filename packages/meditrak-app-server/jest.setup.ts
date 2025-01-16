import { getTestDatabase, clearTestData } from '@tupaia/database';
import { configureEnv } from './src/configureEnv';

configureEnv();

beforeAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
});

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
