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
  logger.verbose('Generating e2e test config...\n');
  const database = new TupaiaDatabase();

  const dashboardReportConfig = await generateDashboardReportConfig({ database, logger });
  writeConfigFile('dashboardReports', dashboardReportConfig);
  logger.success('✔ Dashboard reports\n');
};

const run = () => {
  const logger = getLoggerInstance();

  generateConfig(logger)
    .catch(error => {
      logger.error(error.message);
      process.exit(1);
    })
    .then(() => {
      process.exit(0);
    });
};

run();
