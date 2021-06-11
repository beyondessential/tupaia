/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { urls as reportUrls } from '../config/dashboardReports.json';
import { SNAPSHOTS } from '../constants';
import { preserveUserSession } from '../support';

const checkHasMatrixData = body => {
  const { rows = [], columns = [] } = body;

  const hasColumnCategories = columns[0]?.columns;
  const getColumnKeys = cols => cols.map(c => c.key);
  const columnKeys = hasColumnCategories
    ? columns.map(c => getColumnKeys(c.columns)).flat()
    : getColumnKeys(columns);

  return rows.some(row => Object.keys(row).some(key => columnKeys.includes(key)));
};

const assertUrlResponseHasData = (url, response) => {
  const { body } = response;
  const hasSingleValue = body?.value !== undefined;
  const hasChartData = body?.data?.length > 0;

  if (!hasSingleValue && !hasChartData && !checkHasMatrixData(body)) {
    throw new Error(`Report with url "${url}" has no data`);
  }
};

const urlToRouteRegex = url => {
  const queryParams = url.split('?').slice(1).join('');
  const viewId = new URLSearchParams(queryParams).get('report');
  if (!viewId) {
    throw new Error(`'${url}' is not a valid report url: it must contain a 'report' query param`);
  }

  return new RegExp(`view?.*\\WisExpanded=true&.*viewId=${viewId}[&$]`);
};

describe('Dashboard reports', () => {
  if (reportUrls.length === 0) {
    throw new Error('Dashboard report url list is empty');
  }
  const requireData = Cypress.config('tupaia_requireNonEmptyVisualisations');

  before(() => {
    cy.login();
  });

  beforeEach(() => {
    preserveUserSession();
  });

  reportUrls.forEach(url => {
    it(url, () => {
      cy.server();
      cy.route(urlToRouteRegex(url)).as('report');
      cy.visit(url);
      cy.wait('@report').then(({ response }) => {
        if (requireData) {
          assertUrlResponseHasData(url, response);
        }
      });

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
