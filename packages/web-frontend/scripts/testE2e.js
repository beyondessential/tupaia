/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { execSync } from 'child_process';

import {} from 'dotenv/config';
import { getLoggerInstance, runScriptSync } from '@tupaia/utils';

const runPackageScript = (packageName, script) =>
  execSync(`yarn workspace @tupaia/${packageName} ${script}`, { stdio: 'inherit' });

const testE2e = () => {
  const logger = getLoggerInstance();
  logger.success('Start e2e tests for web-frontend');
  runPackageScript('web-frontend', 'cypress:generate-config');
  runPackageScript('web-frontend', `cypress:run --record`);
};

runScriptSync(testE2e);
