/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { clearTestData, getTestDatabase } from '@tupaia/database';
import { configureEnv } from './src/configureEnv';

configureEnv();

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
