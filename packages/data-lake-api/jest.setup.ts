/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getDatabase } from './src/DataLakeApi';
import { getTestWriteDatabase, clearTestData } from './src/__tests__/utilities';

beforeAll(async () => {
  const testWriteDatabase = getTestWriteDatabase();
  await clearTestData(testWriteDatabase);
});

afterAll(async () => {
  const apiDatabase = getDatabase();
  await apiDatabase.closeConnections();
  const testWriteDatabase = getTestWriteDatabase();
  await clearTestData(testWriteDatabase);
  await testWriteDatabase.closeConnections();
});
