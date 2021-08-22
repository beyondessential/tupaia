/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', ({ email, password }) => {
  cy.visit('/login');

  cy.findByPlaceholderText(/email/i).type(email);
  cy.findByPlaceholderText(/password/i).type(password, { log: false });
  cy.findByText('Login to your account').click();
});
