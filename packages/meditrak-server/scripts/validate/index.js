/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import winston from '../../src/log';
import { validateNoExclusiveTestsExist } from './validateNoExclusiveTestsExist';

const runValidators = async () => {
  await validateNoExclusiveTestsExist();
  winston.info('No exclusive tests found');
};

runValidators().then(
  () => {},
  error => {
    winston.error(error.message);
    process.exit(1);
  },
);
