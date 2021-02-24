/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TEST_USER } from '../constants';

const requireCyEnv = variable => {
  const unprefixedVariable = variable.replace(/^CYPRESS_/, '');
  const value = Cypress.env(unprefixedVariable);
  if (value === undefined) {
    throw new Error(`Could not load Cypress env variable 'CYPRESS_${unprefixedVariable}'`);
  }
  return value;
};

export const submitLoginForm = () => {
  cy.findAllByText(/Sign in/)
    .closest('form')
    .as('loginForm');

  cy.get('@loginForm')
    .findByLabelText(/e-?mail/i)
    .type(TEST_USER.email);
  cy.get('@loginForm')
    .findByLabelText(/password/i)
    .type(requireCyEnv('TEST_USER_PASSWORD'), { log: false });

  cy.get('@loginForm').findByTextI('Sign in').click();
};
