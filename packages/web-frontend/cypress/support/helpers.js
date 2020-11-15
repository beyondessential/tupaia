/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable max-classes-per-file */

import { CONFIG_ROOT } from '../constants';

export const getConfigPath = fileName => `${CONFIG_ROOT}/${fileName}.json`;

const getConfigExamplePath = fileName => `${CONFIG_ROOT}/${fileName}.example.jsonc`;

export class EmptyConfigError extends Error {
  constructor(fileName) {
    const path = getConfigPath(fileName);
    const examplePath = getConfigExamplePath(fileName);
    const generationCommand = '`yarn workspace @tupaia/web-frontend cypress:generate-config`';
    const message = `Test config error: ${path} contains no test data. Either use ${generationCommand} to populate this file, or populate it with manual data. See ${examplePath} for an example`;

    super(message);
    this.name = 'EmptyConfigError';
  }
}

export class TestUserPasswordUndefinedError extends Error {
  constructor() {
    super('Please specify a value for CYPRESS_TEST_USER_PASSWORD in packages/web-frontend/.env');
    this.name = 'TestUserPasswordUndefinedError';
  }
}

/**
 * Preserve user session cookies, which are set during log in
 *
 * @see https://docs.cypress.io/api/cypress-api/cookies.html#Preserve-Once
 */
export const preserveUserSession = () => Cypress.Cookies.preserveOnce('sessionV2');
