/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import moment from 'moment';
import sinonChai from 'sinon-chai';

import { clearTestData, getTestDatabase } from '../testUtilities';

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');

before(() => {
  chai.use(sinonChai);
});

after(async () => {
  const database = getTestDatabase();
  await clearTestData(database, testStartTime);
});
