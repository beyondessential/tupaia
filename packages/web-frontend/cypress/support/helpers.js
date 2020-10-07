/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CONFIG_ROOT } from '../constants';

export const getConfigPath = fileName => `${CONFIG_ROOT}/${fileName}.json`;

const getConfigExamplePath = fileName => `${CONFIG_ROOT}/${fileName}.example.jsonc`;

export class EmptyConfigError extends Error {
  constructor(fileName) {
    const path = getConfigPath(fileName);
    const examplePath = getConfigExamplePath(fileName);
    const message = `Test config error: ${path} contains no test data. Either use \`yarn cypress:generate-config\` to populate this file, or populate it with manual data. See ${examplePath} for an example`;

    super(message);
    this.name = 'EmptyConfigError';
  }
}

/**
 * Preserve user session cookies, which are set during log in
 *
 * @see https://docs.cypress.io/api/cypress-api/cookies.html#Preserve-Once
 */
export const preserveUserSession = () => Cypress.Cookies.preserveOnce('sessionV2');
