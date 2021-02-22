/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';
import { getLoggerInstance } from '../../../../scripts/node/utilities';
import { createTestUsers } from './createTestUsers';

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

const generateConfig = async logger => {
  logger.success('Start e2e test config generation');
  const database = new TupaiaDatabase();

  const results = {
    users: { description: 'Test user', success: false },
  };

  try {
    logger.success('Creating test user...');
    await createTestUsers({ database, logger });
    results.users.success = true;
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
