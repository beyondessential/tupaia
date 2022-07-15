/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import './commands';

export * from './actions';
export * from './helpers';

// We can safely ignore this issue, see https://github.com/quasarframework/quasar/issues/2233
Cypress.on(
  'uncaught:exception',
  error => !/ResizeObserver loop limit exceeded/.test(error.message),
);
