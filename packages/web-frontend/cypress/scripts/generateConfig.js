/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { writeFileSync } from 'fs';

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '../../../../scripts/node/utilities';
import { getConfigPath } from '../support/helpers';
import { generateDashboardReportConfig } from './generateDashboardReportConfig';

const writeConfigFile = (fileName, contents) =>
  writeFileSync(getConfigPath(fileName), JSON.stringify(contents, null, 2));

const generateConfig = async logger => {
  logger.info('Generating e2e test config');
  const database = new TupaiaDatabase();

  const dashboardReportConfig = await generateDashboardReportConfig(database);
  writeConfigFile('dashboardReports', dashboardReportConfig);
  logger.info('✔ Dashboard reports');
};

const run = () => {
  const logger = getLoggerInstance();

  generateConfig(logger)
    .catch(error => {
      logger.error(error.message);
      process.exit(1);
    })
    .then(() => {
      logger.info('Done!');
      process.exit(0);
    });
};

run();
