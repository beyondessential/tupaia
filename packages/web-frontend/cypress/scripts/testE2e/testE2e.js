/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { execSync } from 'child_process';
import {} from 'dotenv/config';

import { getArgs, getLoggerInstance } from '@tupaia/utils';

const scriptConfig = {
  options: {
    ciBuildId: {
      type: 'string',
      description:
        'Used to associate multiple CI machines to one test run, see https://docs.cypress.io/guides/guides/parallelization#Linking-CI-machines-for-parallelization-or-grouping',
    },
  },
};

const runPackageScript = script =>
  execSync(`yarn workspace @tupaia/web-frontend ${script}`, { stdio: 'inherit' });

const buildRunTestsCommand = args => {
  const { ciBuildId } = args;

  const record = !!process.env.CYPRESS_RECORD_KEY;
  let command = `cypress:run --record ${record}`;
  if (ciBuildId) {
    command = `${command} --parallel --ci-build-id ${ciBuildId}`;
  }

  return command;
};

export const testE2e = async () => {
  const args = getArgs(scriptConfig);

  const logger = getLoggerInstance();
  logger.success('Running e2e tests for web-frontend');

  runPackageScript('cypress:config');
  const runTestsCommand = buildRunTestsCommand(args);
  runPackageScript(runTestsCommand);
};
