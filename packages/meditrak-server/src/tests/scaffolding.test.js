import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import moment from 'moment';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { clearTestData } from '@tupaia/database';
import { getIsProductionEnvironment } from '../devops';
import { resetTestData } from './testUtilities';
import { getModels } from './getModels';
import * as SendEmail from '../utilities/sendEmail';

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

before(async () => {
  const isProductionEnvironment = getIsProductionEnvironment();
  if (isProductionEnvironment) {
    // Don't test on production
    throw new Error('Never run the test suite on the production server, it messes with data!');
  }

  sinon.stub(SendEmail, 'sendEmail');

  await resetTestData();

  chai.use(chaiSubset);
  chai.use(deepEqualInAnyOrder);
  chai.use(sinonChai);
  // `chaiAsPromised` must be used after other plugins to promisify them
  chai.use(chaiAsPromised);
});

after(async () => {
  const models = getModels();
  SendEmail.sendEmail.restore();
  await clearTestData(models.database, testStartTime);
});
