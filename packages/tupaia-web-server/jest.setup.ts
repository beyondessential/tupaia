import { getTestDatabase, clearTestData } from '@tupaia/database';

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
