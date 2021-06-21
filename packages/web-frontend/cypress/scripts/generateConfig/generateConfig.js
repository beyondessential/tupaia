/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '@tupaia/utils';
import config from '../../config.json';
import { generateOverlayConfig } from './generateOverlayConfig';
import { generateReportConfig } from './generateReportConfig';
import { generateTestUser } from './generateTestUser';
import { writeJsonFile } from './helpers';

const GENERATED_CONFIG_PATH = 'cypress/generatedConfig.json';

export const generateConfig = async () => {
  const logger = getLoggerInstance();
  const db = new TupaiaDatabase();

  logger.success('Start e2e test config generation');
  logger.success('* Generating test user...');
  await generateTestUser(db);

  logger.success('* Generating dashboard report config...');
  const dashboardReports = await generateReportConfig(db);
  logger.info(`  Generated ${dashboardReports.urls.length} report urls`);

  logger.success('* Generating map overlay urls...');
  const mapOverlays = await generateOverlayConfig(db);
  logger.info(`  Generated ${mapOverlays.urls.length} overlay urls`);

  writeJsonFile(GENERATED_CONFIG_PATH, { ...config, dashboardReports, mapOverlays });
};
