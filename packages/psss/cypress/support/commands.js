/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import '@testing-library/cypress/add-commands';

import { TEST_USER_1, TEST_USER_2 } from '../constants';
import { login } from './actions';

Cypress.Commands.add('loginTestUser1', () => {
  login(TEST_USER_1);
});

Cypress.Commands.add('loginTestUser2', () => {
  login(TEST_USER_2);
});

Cypress.Commands.add('assertMultiCountryHome', () => {
  cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  cy.findByText(/countries*/i, { selector: 'h1' });
});

Cypress.Commands.add('assertSingleCountryHome', () => {
  cy.url().should('eq', `${Cypress.config().baseUrl}/weekly-reports/TO`);
  cy.findByText(/tonga*/i, { selector: 'h1' });
});

Cypress.Commands.add('assertWeeklyReportsPage', () => {
  cy.findByText(/back to countries*/i);
  cy.url().should('contain', `weekly-reports`);
});
