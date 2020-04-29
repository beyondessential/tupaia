/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { clearTestData, getDatabase } from '../testUtilities';

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');

after(async () => {
  const database = getDatabase();
  await clearTestData(database, testStartTime);
});
