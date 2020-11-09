/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('private route', () => {
  it('redirects a logged out user from base url to the login form', () => {
    cy.visit('/');
    cy.findByPlaceholderText(/email/i);
    cy.findByPlaceholderText(/password/i);
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
  });

  it('redirects a logged out user from a weekly-reports url to the login form', () => {
    cy.visit('/weekly-reports/to');
    cy.findByPlaceholderText(/email/i);
    cy.findByPlaceholderText(/password/i);
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
  });

  it('does not let a single country user see the countries page', () => {
    cy.server();
    cy.route('POST', '**auth', 'fixture:singleCountryUserAuth.json').as('auth');
    cy.login();
    cy.visit('/');
    cy.findByText(/authorisation required/i, { selector: 'h1' });
    cy.findByText(/countries/).should('not.exist');
  });

  it('does not let a single country user see the wrong country page', () => {
    cy.server();
    cy.route('POST', '**auth', 'fixture:singleCountryUserAuth.json').as('auth');
    cy.login();
    cy.visit('/weekly-reports/ws');
    cy.findByText(/authorisation required/i, { selector: 'h1' });
  });

  it('shows a 404 page if a user goes to an invalid url', () => {
    cy.server();
    cy.route('POST', '**auth', 'fixture:singleCountryUserAuth.json').as('auth');
    cy.login();
    cy.visit('/chewbacca');
    cy.findByText(/404/i, { selector: 'h1' });
  });
});
