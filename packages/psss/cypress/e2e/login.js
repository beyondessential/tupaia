/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const user = require('../fixtures/exampleUser');

describe('login', () => {
  it('should login an existing user', () => {
    cy.visit('/login');
    cy.findByPlaceholderText(/email/i).type(user.username);
    cy.findByPlaceholderText(/password/i).type(user.password);
    cy.findByText(/login*/i)
      .closest('button')
      .click();
    cy.findByText(/countries*/i, { selector: 'h1' });
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});
