import moment from 'moment';

import { getIsProductionEnvironment } from '../devops';
import { resetTestData, clearTestData } from './testUtilities';

const testStartTime = moment().format('YYYY-MM-DD HH:mm:ss');

// These setup tasks need to be performed before any test, so we
// do them in this file outside of any describe block.

before(async () => {
  const isProductionEnvironment = getIsProductionEnvironment();
  if (isProductionEnvironment) {
    // Don't test on production
    throw new Error('Never run the test suite on the production server, it messes with data!');
  }

  await resetTestData();
});

after(async () => {
  await clearTestData(testStartTime);
});
