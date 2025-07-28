import { getTestDatabase, clearTestData } from '@tupaia/database';
import { setupTestData } from './src/__tests__/testUtilities';
import { configureEnv } from './src/configureEnv';

configureEnv();

beforeAll(async () => {
  await setupTestData();
});

afterAll(async () => {
  const database = getTestDatabase();
  await database.waitForAllChangeHandlersCompleted();
  await clearTestData(database);
  await database.waitForAllChangeHandlersCompleted();
  await database.closeConnections();
});
