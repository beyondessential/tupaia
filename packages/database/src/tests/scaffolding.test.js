/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';

import { clearTestData, getTestDatabase } from '../testUtilities';

before(() => {
  chai.use(deepEqualInAnyOrder);
  chai.use(sinonChai);
});

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
after(async () => {
  const database = getTestDatabase();
  await clearTestData(database, testStartTime);
});
