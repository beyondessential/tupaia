/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { requireCyEnv } from '@tupaia/utils';

describe('Test that e2e tests work', () => {
  before(() => {
    cy.login({
      email: requireCyEnv('CYPRESS_TEST_USER_EMAIL'),
      password: requireCyEnv('CYPRESS_TEST_USER_PASSWORD'),
    });
  });

  it('Loads the surveys page after login', () => {
    cy.url().should('eq', `${Cypress.config().baseUrl}/surveys`);
  });
});
