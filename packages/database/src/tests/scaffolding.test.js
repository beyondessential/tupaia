/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import moment from 'moment';
import sinonChai from 'sinon-chai';
import winston from 'winston';

import { clearTestData, getTestDatabase } from '../testUtilities';

// Silence winston logs
winston.configure({
  transports: [new winston.transports.Console({ silent: true })],
});

before(() => {
  chai.use(deepEqualInAnyOrder);
  chai.use(sinonChai);
});

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
after(async () => {
  const database = getTestDatabase();
  await clearTestData(database, testStartTime);
  await database.closeConnections();
});
