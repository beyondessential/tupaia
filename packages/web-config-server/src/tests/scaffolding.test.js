/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiLike from 'chai-like';
import sinonChai from 'sinon-chai';
import moment from 'moment';
import { clearTestData } from '@tupaia/database';
import { getIsProductionEnvironment } from '@tupaia/utils';
import { getTestModels } from './getTestModels';

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

before(() => {
  const isProductionEnvironment = getIsProductionEnvironment();
  if (isProductionEnvironment) {
    // Don't test on production
    throw new Error('Never run the test suite on the production server, it messes with data!');
  }

  chai.use(chaiLike);
  chai.use(sinonChai);

  // `chaiAsPromised` must be used after other plugins to promisify them
  chai.use(chaiAsPromised);
});

after(async () => {
  const models = getTestModels();

  await clearTestData(models.database, testStartTime);
  await models.database.closeConnections();
});
