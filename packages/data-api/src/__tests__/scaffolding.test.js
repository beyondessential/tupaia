/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import sinonChai from 'sinon-chai';
import winston from 'winston';
import { clearTestData, getTestDatabase } from '@tupaia/database';

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

before(() => {
  chai.use(sinonChai);
  chai.use(deepEqualInAnyOrder);
  // `chaiAsPromised` must be used after other plugins to promisify them
  chai.use(chaiAsPromised);

  // TODO This is used to silence `winston` logs thrown by `@tupaia/utils.ObjectValidator`
  // Remove when https://github.com/beyondessential/tupaia-backlog/issues/1201 is addressed
  winston.configure({
    transports: [new winston.transports.Console({ silent: true })],
  });
});

after(async () => {
  await clearTestData(getTestDatabase());
});
