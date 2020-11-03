/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EmptyConfigError, preserveUserSession } from '../support';
import config from '../config/dashboardReports.json';

const urlToRouteRegex = url => {
  const queryParams = url.split('?').slice(1).join('');
  const viewId = new URLSearchParams(queryParams).get('report');
  if (!viewId) {
    throw new Error(`'${url}' is not a valid report url: it must contain a 'report' query param`);
  }

  return new RegExp(`view?.*viewId=${viewId}`);
};

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
      cy.route(urlToRouteRegex(url)).as('report');

      cy.visit(url);
      cy.wait('@report');
      cy.findByTestId('enlarged-dialog').snapshotHtml({ name: 'html' });
    });
  });
});
