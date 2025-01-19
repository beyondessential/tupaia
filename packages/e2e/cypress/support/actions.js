import { requireCyEnv } from './utils';

export const submitLoginForm = () => {
  // eslint-disable-next-line cypress/no-force
  cy.findByTextI('Sign in / Register').click({ force: true });

  cy.findAllByText(/Sign in/)
    .closest('form')
    .as('loginForm');

  cy.get('@loginForm')
    .findByLabelText(/e-?mail/i)
    .type(requireCyEnv('CYPRESS_TEST_USER_EMAIL'));
  cy.get('@loginForm')
    .findByLabelText(/password/i)
    .type(requireCyEnv('CYPRESS_TEST_USER_PASSWORD'), { log: false });

  cy.get('@loginForm').findByTextI('Sign in').click();
};
