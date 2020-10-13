/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EXPLORE_PROJECT } from '../constants';
import { equalStringsI } from './utils';

export const submitLoginForm = () => {
  cy.findAllByText(/Sign in/)
    .closest('form')
    .as('loginForm');

  cy.get('@loginForm')
    .findByLabelText(/e-?mail/i)
    .type(Cypress.env('USER_EMAIL'));
  cy.get('@loginForm')
    .findByLabelText(/password/i)
    .type(Cypress.env('USER_PASSWORD'), { log: false });

  cy.get('@loginForm').findByTextI('Sign in').click();
};

export const closeOverlay = () => {
  cy.findByTestId('overlay-close-btn').click();
};

export const closeOpenDialogs = () => {
  cy.get('body').click(0, 0);
};

export const closeEnlargedDialog = () => {
  cy.findByTestId('enlarged-dialog-close-btn').click();
};

export const selectProject = name => {
  cy.findByTextI(Cypress.env('USER_NAME')).click();
  cy.findByTextI('View projects').click();

  if (equalStringsI(name, EXPLORE_PROJECT)) {
    cy.findByTextI('I just want to explore').click();
    return;
  }

  cy.findByTextI(name).closestByTestId('project-card').findByTextI('View Project').click();
};

export const selectDashboardGroup = name => {
  cy.findByTestId('dropdown-menu')
    .invoke('text')
    .then(selectedName => {
      if (equalStringsI(selectedName, name)) {
        return;
      }

      toggleDropdownMenu();
      cy.findByTestId('dropdown-menu-items').findByTextI(name).click();
    });
};

const toggleDropdownMenu = () => {
  cy.findByTestId('dropdown-menu').findByRole('button').click();
};

export const expandDashboardItem = name => {
  cy.findByTestId('dashboard-group')
    .findByTextI(name)
    .closestByTestId('view')
    .findByRole('button')
    .click();
};
