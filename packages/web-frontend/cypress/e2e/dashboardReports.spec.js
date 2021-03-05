/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import config from '../config/dashboardReports.json';
import { SNAPSHOTS } from '../constants';
import { EmptyConfigError, preserveUserSession } from '../support';

const urlToRouteRegex = url => {
  const queryParams = url.split('?').slice(1).join('');
  const viewId = new URLSearchParams(queryParams).get('report');
  if (!viewId) {
    throw new Error(`'${url}' is not a valid report url: it must contain a 'report' query param`);
  }

  return new RegExp(`view?.*\\WisExpanded=true&.*viewId=${viewId}[&$]`);
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

      cy.findByTestId('enlarged-dialog').as('enlargedDialog');
      // Capture and store the snapshot using the "new" key, to avoid comparison with existing snapshots.
      // We want to store the new snapshots no matter what: a failed comparison would prevent that
      cy.get('@enlargedDialog').snapshotHtml({ name: SNAPSHOTS.newKey });
      // Then, use the "standard" key to trigger a comparison with existing snapshots.
      // This way we check for regression
      cy.get('@enlargedDialog').snapshotHtml({ name: SNAPSHOTS.key });
    });
  });
});
