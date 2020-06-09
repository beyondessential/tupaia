/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

describe('login', () => {
  it('should login an existing user', () => {
    const user = {
      username: 'caigertom@gmail.com',
      password: 'Pinkie3235',
    };
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
