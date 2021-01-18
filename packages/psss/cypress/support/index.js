import '@testing-library/cypress/add-commands';
import './commands';

// Cypress does not currently support fetch api,
// so delete window.fetch on every window load so that requests fall back to xhr
// https://docs.cypress.io/guides/guides/network-requests.html#Testing-Strategies
Cypress.on('window:before:load', win => {
  // eslint-disable-next-line no-param-reassign
  delete win.fetch;
});

// By default uncaught expections fail the tests, turn off this behaviour
// https://docs.cypress.io/guides/references/error-messages.html#Uncaught-exceptions-from-your-application
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
