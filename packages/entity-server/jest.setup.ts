/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getTestDatabase, clearTestData } from '@tupaia/database';
import { setupTestData } from './src/__tests__/testUtilities';
import { configureEnv } from './src/configureEnv';

configureEnv();

beforeAll(async () => {
  await setupTestData();
});

afterAll(async () => {
  const database = getTestDatabase();
  await database.waitForAllChangeHandlers();
  await clearTestData(database);
  await database.waitForAllChangeHandlers();
  await database.closeConnections();
});
