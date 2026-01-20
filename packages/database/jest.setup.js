import { configureEnv } from './src/server/configureEnv';
import { clearTestData, getTestDatabase } from './src/server/testUtilities';

configureEnv();

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
