/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { getTestDatabase, clearTestData } from '@tupaia/database';

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

before(() => {
  chai.use(sinonChai);

  // `chaiAsPromised` must be used after other plugins to promisify them
  chai.use(chaiAsPromised);
});

after(async () => {
  await clearTestData(getTestDatabase());
});
