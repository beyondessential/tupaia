/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getTestDatabase, clearAllTestData } from '@tupaia/database';

afterAll(async () => {
  const database = getTestDatabase();
  await clearAllTestData(database);
  await database.closeConnections();
});
