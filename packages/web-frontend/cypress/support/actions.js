/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TEST_USER } from '../constants';
import { TestUserPasswordUndefinedError } from './helpers';

const getTestUserPassword = () => {
  const password = Cypress.env('TEST_USER_PASSWORD');
  if (!password) {
    throw new TestUserPasswordUndefinedError();
  }
  return password;
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
    .type(getTestUserPassword(), { log: false });

  cy.get('@loginForm').findByTextI('Sign in').click();
};

export const closeOverlay = () => {
  cy.findByTestId('overlay-close-btn').click();
};
