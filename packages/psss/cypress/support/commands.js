/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

Cypress.Commands.add('login', () => {
  const USER = Cypress.env('username');
  const PASS = Cypress.env('userPassword');

  cy.visit('/login');
  cy.findByPlaceholderText(/email/i).type(USER);
  cy.findByPlaceholderText(/password/i).type(PASS);
  cy.findByRole('button', { name: /login*/i }).click();
});

Cypress.Commands.add('assertHome', () => {
  cy.findByText(/countries*/i, { selector: 'h1' });
  cy.url().should('eq', `${Cypress.config().baseUrl}/`);
});

Cypress.Commands.add('assertWeeklyReportsPage', () => {
  cy.findByText(/back to countries*/i);
  cy.url().should('contain', `weekly-reports`);
});
