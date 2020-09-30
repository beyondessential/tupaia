/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getTestDatabase, clearTestData } from '@tupaia/database';

beforeAll(done => {
  done();
});

afterAll(async done => {
  await clearTestData(getTestDatabase());
  done();
});
