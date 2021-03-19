/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '@tupaia/utils';
import { createTestUsers } from './createTestUsers';

export const generateConfig = async () => {
  const logger = getLoggerInstance();
  const db = new TupaiaDatabase();

  logger.success('Start e2e test config generation');
  logger.success('Creating test user...');
  await createTestUsers(db);
  logger.success(`✔ Test user`);
};
