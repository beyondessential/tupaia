/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '@tupaia/utils';
import { createTestUser } from './createTestUser';
import { generateReportConfig } from './generateReportConfig';

export const generateConfig = async () => {
  const logger = getLoggerInstance();
  const db = new TupaiaDatabase();

  logger.success('Start e2e test config generation');
  logger.success('Creating test user...');
  await createTestUser(db);
  logger.success(`✔ Test user`);

  logger.success('Generating dashboard report config...');
  generateReportConfig();
  logger.success(`✔ Dashboard reports`);
};
