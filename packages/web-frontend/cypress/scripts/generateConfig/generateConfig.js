/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { writeFileSync } from 'fs';

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '@tupaia/utils';
import { getConfigPath } from '../../support/helpers';
import { createTestUser } from './createTestUser';
import { generateDashboardReportConfig } from './generateDashboardReportConfig';

const writeConfigFile = (fileName, contents) =>
  writeFileSync(getConfigPath(fileName), JSON.stringify(contents, null, 2));

export const generateConfig = async () => {
  const logger = getLoggerInstance();
  const database = new TupaiaDatabase();

  logger.success('Start e2e test config generation');
  logger.success('Creating test user...');
  await createTestUser({ database, logger });
  logger.success(`✔ Test user`);

  logger.success('Generating dashboard report config...');
  const dashboardReportConfig = await generateDashboardReportConfig({ database });
  writeConfigFile('dashboardReports', dashboardReportConfig);
  logger.success(`✔ Dashboard reports`);
};
