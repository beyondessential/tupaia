/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { execSync } from 'child_process';
import {} from 'dotenv/config';
import fs from 'fs';

import { getArgs, getLoggerInstance } from '@tupaia/utils';
import { E2E_CONFIG_PATH } from '../../constants';
import { generateConfig } from '../generateConfig/generateConfig';

const scriptConfig = {
  options: {
    ciBuildId: {
      type: 'string',
      description:
        'Used in CI/CD builds to associate multiple CI machines with one test run, see https://docs.cypress.io/guides/guides/parallelization#Linking-CI-machines-for-parallelization-or-grouping',
    },
  },
};

const printResults = ({ baselineUrl, compareUrl }, { baseError, compareError }) => {
  const logger = getLoggerInstance();

  logger.info();

  const printResult = (description, error) => {
    if (error) {
      logger.error(`❌ ${description}`);
    } else {
      logger.success(`✔ ${description}`);
    }
  };

  printResult(`Baseline url: ${baselineUrl}`, baseError);
  printResult(`Compare url: ${compareUrl}`, compareError);

  if (baseError || compareError) {
    logger.error(`❌ E2e tests failed`);
    if (baseError) {
      logger.error(
        [
          '',
          'Note: since the tests for the baseline url failed, some base snapshots may be missing.',
          'If this is true the test cases that depend on those snapshots may be false positive: tests always pass when snapshots are empty',
          'Please check the detailed cypress logs to determine whether this is the case',
        ].join('\n'),
      );
    }
    process.exit(1);
  } else {
    logger.success(`✔ E2e tests passed!`);
  }
};

const runTestsAgainstUrl = (url, options = {}) => {
  const { ciBuildId = '', record = false } = options;

  let command = `cypress:run --record ${record}`;
  if (ciBuildId) {
    command = `${command} --parallel --ci-build-id ${ciBuildId}`;
  }

  execSync(`CYPRESS_BASE_URL=${url} yarn workspace @tupaia/web-frontend ${command}`, {
    stdio: 'inherit',
  });
};

const checkUrlExists = url => {
  try {
    execSync(`curl --output /dev/null --silent --head --fail ${url}`);
  } catch (error) {
    throw new Error(`No deployment exists for ${url}, cancelling e2e tests`);
  }
};

export const testE2e = async () => {
  const { ciBuildId } = getArgs(scriptConfig);

  const logger = getLoggerInstance();
  logger.success('Running e2e tests for web-frontend');

  await generateConfig();
  const { baselineUrl, compareUrl } = JSON.parse(
    fs.readFileSync(E2E_CONFIG_PATH, { encoding: 'utf-8' }),
  );
  // Check both urls before running the tests, in case one of them is invalid
  checkUrlExists(baselineUrl);
  checkUrlExists(compareUrl);

  let baseError;
  try {
    logger.info(`\nStarting base snapshot capture against ${baselineUrl}...`);
    runTestsAgainstUrl(baselineUrl);
  } catch (error) {
    logger.error(error.message);
    baseError = error;
  }

  let compareError;
  try {
    logger.info(`\nStarting compare snapshot capture against ${compareUrl}...`);
    const record = !!process.env.CYPRESS_RECORD_KEY;
    runTestsAgainstUrl(compareUrl, { ciBuildId, record });
  } catch (error) {
    logger.error(error.message);
    compareError = error;
  }

  printResults({ baselineUrl, compareUrl }, { baseError, compareError });
};
