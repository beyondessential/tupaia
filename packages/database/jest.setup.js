/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { clearTestData, getTestDatabase } from './src/testUtilities';

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database, testStartTime);
  await database.closeConnections();
});
