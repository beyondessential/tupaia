/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { clearTestData, getTestDatabase } from '@tupaia/database';
import { TestableEntityServer } from './TestableEntityServer';

export const tearDownTestApp = async (app: TestableEntityServer) => {
  await clearTestData(getTestDatabase());
  app.revokeAccess();
};
