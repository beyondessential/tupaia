/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';

Cypress.Commands.add('login', ({ email, password }) => {
  cy.visit('/login');
  cy.findByPlaceholderText(/email/i).type(email);
  cy.findByPlaceholderText(/password/i).type(password, { log: false });
  cy.findByText('Login to your account').click();
});

Cypress.Commands.add('selectIntoTextBox', (labelText, inputText) => {
  cy.get('input[placeholder="Start typing to search"]').then(() => {
    cy.findByLabelText(labelText).type(inputText).type('{downarrow}').type('{enter}');
  });
});

Cypress.Commands.add('selectDropDownValue', (labelText, currentValue, valueToBeSelected) => {
  cy.contains(labelText).parent().contains(currentValue).click();
  cy.contains(valueToBeSelected).click();
});

Cypress.Commands.add('uploadFile', filePath => {
  cy.findByText('Choose file').click();
  cy.get('input[type="file"]').attachFile(filePath);
});

Cypress.Commands.add('getFirstRowElementsOfTable', () => {
  cy.get('.rt-tbody').find('[role="row"]').find('[role="gridcell"]');
});
