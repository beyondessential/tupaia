/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { requireCyEnv } from '@tupaia/utils';

import { TEST_USER } from '../constants';

export const submitLoginForm = () => {
  cy.findAllByText(/Sign in/)
    .closest('form')
    .as('loginForm');

  cy.get('@loginForm')
    .findByLabelText(/e-?mail/i)
    .type(TEST_USER.email);
  cy.get('@loginForm')
    .findByLabelText(/password/i)
    .type(requireCyEnv('CYPRESS_TEST_USER_PASSWORD'), { log: false });

  cy.get('@loginForm').findByTextI('Sign in').click();
};
