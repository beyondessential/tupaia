import { getLoggerInstance, writeJsonFile } from '@tupaia/utils';
import config from '../../config.json';
import { E2E_CONFIG_PATH } from '../../constants';
import { generateOverlayConfig } from './generateOverlayConfig';
import { generateReportConfig } from './generateReportConfig';
import { configSchema } from './configSchema';

const INPUT_CONFIG_PATH = 'cypress/config.json';

const validateConfig = () => {
  try {
    configSchema.validateSync(config, { strict: true });
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new Error(`Validation of ${INPUT_CONFIG_PATH} failed with "${error.message}"`);
    }
    throw error;
  }
};

export const generateConfig = async () => {
  const logger = getLoggerInstance();

  logger.success('Start e2e test config generation');
  validateConfig();
  logger.success(`✔ Configuration is valid`);

  logger.success('* Generating dashboard report config...');
  const dashboardReports = await generateReportConfig();
  logger.info(`  Generated ${dashboardReports.urls.length} report urls`);

  logger.success('* Generating map overlay urls...');
  const mapOverlays = await generateOverlayConfig();
  logger.info(`  Generated ${mapOverlays.urls.length} overlay urls`);

  writeJsonFile(E2E_CONFIG_PATH, { ...config, dashboardReports, mapOverlays });
};
