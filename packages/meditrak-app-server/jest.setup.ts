/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getTestDatabase, clearTestData } from '@tupaia/database';

beforeAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
});

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
