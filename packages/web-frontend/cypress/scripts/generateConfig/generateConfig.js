/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '@tupaia/utils';
import { generateReportConfig } from './generateReportConfig';
import { generateTestUser } from './generateTestUser';

export const generateConfig = async () => {
  const logger = getLoggerInstance();
  const db = new TupaiaDatabase();

  logger.success('Start e2e test config generation');
  logger.success('* Generating test user...');
  await generateTestUser(db);

  logger.success('* Generating dashboard report config...');
  generateReportConfig();
};
