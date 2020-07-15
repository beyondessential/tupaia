/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import '@testing-library/cypress/add-commands';

import snapshot from '@cypress/snapshot';
import { PUBLIC_USER } from '../constants';
import { escapeRegex } from './utilities';
import { closeOverlay, submitLoginForm } from './actions';

snapshot.register();

Cypress.Commands.add('closestByTestId', { prevSubject: 'element' }, (subject, testId) =>
  cy.wrap(subject).closest(`[data-testid="${testId}"]`),
);

Cypress.Commands.add(
  'findByTextI',
  { prevSubject: ['element', 'optional'] },
  (subject, searchText, options) =>
    cy.wrap(subject).findByText(new RegExp(escapeRegex(searchText), 'i'), options),
);

Cypress.Commands.add('login', () => {
  cy.server();
  cy.route(/\/getUser/).as('getUser');

  cy.visit('/');
  cy.wait('@getUser').then(({ response }) => {
    if (response.body.name === PUBLIC_USER) {
      submitLoginForm();
    } else {
      closeOverlay();
    }
  });
});
