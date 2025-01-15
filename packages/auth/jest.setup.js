import path from 'path';
import { getTestDatabase, clearTestData } from '@tupaia/database';
import { configureDotEnv } from '@tupaia/server-utils';

configureDotEnv([
  path.resolve(__dirname, '../../env/db.env'),
  path.resolve(__dirname, '../../env/servers.env'),
]);

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
