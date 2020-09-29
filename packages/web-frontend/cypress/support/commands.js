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
  cy.route(/\/projects/).as('projects');

  cy.visit('/');
  cy.wait('@getUser').then(({ response }) => {
    if (response.body.name === PUBLIC_USER) {
      // TODO This is a temporary hack to make sure that the login form is stable
      // Remove it when https://github.com/beyondessential/tupaia-backlog/issues/1358 is fixed
      cy.wait('@projects');

      submitLoginForm();
      cy.wait('@getUser').then(() => {
        closeOverlay();
      });
    } else {
      closeOverlay();
    }
  });
});
