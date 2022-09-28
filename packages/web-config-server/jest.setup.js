/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { clearTestData, getTestDatabase } from '@tupaia/database';

import { getIsProductionEnvironment } from '/utils';

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

beforeAll(() => {
  const isProductionEnvironment = getIsProductionEnvironment();
  if (isProductionEnvironment) {
    // Don't test on production
    throw new Error('Never run the test suite on the production server, it messes with data!');
  }
});

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
