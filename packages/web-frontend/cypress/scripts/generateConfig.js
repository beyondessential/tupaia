/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { writeFileSync } from 'fs';

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '../../../../scripts/node/utilities';
import { getConfigPath } from '../support/helpers';
import { createTestUser } from './createTestUser';
import { generateDashboardReportConfig } from './generateDashboardReportConfig';

const logResults = (logger, results) => {
  logger.success();
  Object.values(results).forEach(({ description, success }) => {
    if (success) {
      logger.success(`✔ ${description}`);
    } else {
      logger.error(`❌ ${description}`);
    }
  });
};

const writeConfigFile = (fileName, contents) =>
  writeFileSync(getConfigPath(fileName), JSON.stringify(contents, null, 2));

const generateConfig = async logger => {
  logger.success('Start e2e test config generation');
  const database = new TupaiaDatabase();

  const results = {
    user: { description: 'Test user', success: false },
    reports: { description: 'Dashboard reports', success: false },
  };

  try {
    logger.success('Creating test user...');
    await createTestUser({ database, logger });
    results.user.success = true;

    logger.success('Generating dashboard report config...');
    const dashboardReportConfig = await generateDashboardReportConfig({ database, logger });
    writeConfigFile('dashboardReports', dashboardReportConfig);
    results.reports.success = true;
  } catch (error) {
    logger.error(error.message);
  }

  logResults(logger, results);
  return Object.values(results).every(r => r.success);
};

const run = () => {
  const logger = getLoggerInstance();

  generateConfig(logger)
    .catch(error => {
      logger.error(error.message);
      process.exit(1);
    })
    .then(success => {
      process.exit(success ? 0 : 1);
    });
};

run();
