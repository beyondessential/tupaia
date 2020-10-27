/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EmptyConfigError, preserveUserSession } from '../support';
import config from '../config/dashboardReports.json';

describe('Dashboard reports', () => {
  if (config.length === 0) {
    throw new EmptyConfigError('dashboardReports');
  }

  before(() => {
    cy.login();
  });

  beforeEach(() => {
    preserveUserSession();
  });

  config.forEach(url => {
    it(url, () => {
      cy.server();
      cy.route(/\/dashboard/).as('dashboard');

      cy.visit(url);
      cy.wait('@dashboard');
      cy.findByTestId('enlarged-dialog').snapshotHtml({ name: 'html' });
    });
  });
});
