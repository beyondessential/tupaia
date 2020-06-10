import '@testing-library/cypress/add-commands';
import './commands';

// Delete window.fetch on every window load
Cypress.on('window:before:load', win => {
  delete win.fetch;
});
