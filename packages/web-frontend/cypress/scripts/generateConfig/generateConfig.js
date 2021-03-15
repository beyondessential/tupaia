/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { writeFileSync } from 'fs';

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '@tupaia/utils';
import { createTestUser } from './createTestUser';
import { generateReportConfig } from './generateReportConfig';

const REPORT_CONFIG_PATH = 'cypress/config/dashboardReports.json';

export const generateConfig = async () => {
  const logger = getLoggerInstance();
  const db = new TupaiaDatabase();

  logger.success('Start e2e test config generation');
  logger.success('Creating test user...');
  await createTestUser(db);
  logger.success(`✔ Test user`);

  logger.success('Generating dashboard report config...');
  const reportConfig = await generateReportConfig(db);
  writeFileSync(REPORT_CONFIG_PATH, JSON.stringify(reportConfig, null, 2));
  logger.success(`✔ Dashboard reports`);
};
