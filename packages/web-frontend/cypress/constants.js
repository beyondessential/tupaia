/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { integrationFolder } from '../cypress.json';

export const CONFIG_ROOT = 'cypress/config';
export const PUBLIC_USER = 'public';
export const SNAPSHOTS = {
  path: `${integrationFolder}/snapshots.js`,
  key: 'snapshot',
  newKey: 'newSnapshot',
  repoUrl: 'git@github.com:beyondessential/tupaia-e2e-snapshots.git',
  pathInRepo: 'snapshots/web-frontend.json',
};
export const TEST_USER = {
  email: 'test_e2e@beyondessential.com.au',
  firstName: 'TestE2eFirst',
  lastName: 'TestE2eLast',
};
