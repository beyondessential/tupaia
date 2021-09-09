/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { loginAsSuperUser } from '../support';

describe('login as a super user user', () => {
  before(() => {
    loginAsSuperUser();
  });

  it('Loads the surveys page after login', () => {
    cy.url().should('eq', `${Cypress.config().baseUrl}/surveys`);
  });
});
