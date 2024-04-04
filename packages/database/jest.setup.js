/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { configureEnv } from './src/configureEnv';
import { clearTestData, getTestDatabase } from './src/testUtilities';

configureEnv();

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
