/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { requireCyEnv } from '@tupaia/utils';

export const login = user => {
  const password = requireCyEnv('CYPRESS_TEST_USER_PASSWORD');

  cy.visit('/login');
  cy.findByPlaceholderText(/email/i).type(user.email);
  cy.findByPlaceholderText(/password/i).type(password);
  cy.findByRole('button', { name: /login*/i }).click();
};
