import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import winston from 'winston';

import { clearTestData } from '@tupaia/database';
import { getIsProductionEnvironment } from '@tupaia/utils';
import * as ServerUtils from '@tupaia/server-utils';
import { getModels, resetTestData } from './testUtilities';

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.
let sendEmailStub;

before(async () => {
  const isProductionEnvironment = getIsProductionEnvironment();
  if (isProductionEnvironment) {
    // Don't test on production
    throw new Error('Never run the test suite on the production server, it messes with data!');
  }

  sendEmailStub = sinon.stub(ServerUtils, 'sendEmail');

  await resetTestData();

  chai.use(chaiSubset);
  chai.use(deepEqualInAnyOrder);
  chai.use(sinonChai);
  // `chaiAsPromised` must be used after other plugins to promisify them
  chai.use(chaiAsPromised);

  // Silence winston logs
  winston.configure({
    transports: [new winston.transports.Console({ silent: true })],
  });
});

after(async () => {
  const models = getModels();
  sendEmailStub.restore();
  await clearTestData(models.database);
  await models.database.closeConnections();
});
