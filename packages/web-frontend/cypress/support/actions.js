/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const submitLoginForm = () => {
  cy.findAllByText(/Sign in/)
    .closest('form')
    .as('loginForm');

  cy.get('@loginForm')
    .findByLabelText(/e-?mail/i)
    .type(Cypress.env('USER_EMAIL'));
  cy.get('@loginForm')
    .findByLabelText(/password/i)
    .type(Cypress.env('USER_PASSWORD'), { log: false });

  cy.get('@loginForm').findByTextI('Sign in').click();
};

export const closeOverlay = () => {
  cy.findByTestId('overlay-close-btn').click();
};
