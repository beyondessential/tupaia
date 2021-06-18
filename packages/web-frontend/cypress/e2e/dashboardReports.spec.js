/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { urls as reportUrls } from '../config/dashboardReports.json';
import { preserveUserSession } from '../support';

const SNAPSHOT_TYPES = {
  RESPONSE_BODY: 'responseBody',
  HTML: 'html',
};

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
  const { dashboardReports: config = {} } = Cypress.config('tupaia');
  const { allowEmptyResponse, snapshotTypes } = config;
  if (!Array.isArray(snapshotTypes) || snapshotTypes.length === 0) {
    throw new Error(`No snapshot types specified`);
  }

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
        if (!allowEmptyResponse) {
          assertUrlResponseHasData(url, response);
        }
        if (snapshotTypes.includes(SNAPSHOT_TYPES.RESPONSE_BODY)) {
          cy.wrap(response.body).as('responseBody');
          cy.get('@responseBody').snapshot({ name: SNAPSHOT_TYPES.RESPONSE_BODY });
        }
      });

      if (snapshotTypes.includes(SNAPSHOT_TYPES.HTML)) {
        cy.findByTestId('enlarged-dialog').as('enlargedDialog');
        cy.get('@enlargedDialog').snapshotHtml({ name: SNAPSHOT_TYPES.HTML });
      }
    });
  });
});
