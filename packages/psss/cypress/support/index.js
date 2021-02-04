import '@testing-library/cypress/add-commands';
import './commands';

// By default uncaught expections fail the tests, turn off this behaviour
// https://docs.cypress.io/guides/references/error-messages.html#Uncaught-exceptions-from-your-application
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
