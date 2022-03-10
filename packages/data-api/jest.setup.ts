/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getTestModels, setupTest, clearTestData } from '@tupaia/database';
import { SETUP } from './src/__tests__/TupaiaDataApi.fixtures';

const models = getTestModels();

beforeAll(async () => {
  jest.setTimeout(30000); // Extend default jest timeout as these tests can take a while
  await setupTest(models, SETUP);
});

afterAll(async () => {
  await clearTestData(models.database);
  await models.database.closeConnections();
});
