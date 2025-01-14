import config from '../__generatedConfig.json';
import { SNAPSHOT_TYPES } from '../constants';
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
  const itemCode = new URLSearchParams(queryParams).get('report');
  if (!itemCode) {
    throw new Error(`'${url}' is not a valid report url: it must contain a 'report' query param`);
  }

  return new RegExp(`(legacyDashboardReport|report)/.*\\?(.*&|)itemCode=${itemCode}(&|$)`);
};

describe('Dashboard reports', () => {
  const { allowEmptyResponse, snapshotTypes, urls } = config.dashboardReports;

  before(() => {
    cy.login();
  });

  beforeEach(() => {
    preserveUserSession();
  });

  urls.forEach(url => {
    it(url, () => {
      cy.server();
      cy.route(urlToRouteRegex(url)).as('report');
      cy.visit(url);

      cy.wait('@report').then(({ response }) => {
        if (!allowEmptyResponse) {
          assertUrlResponseHasData(url, response);
        }
        if (snapshotTypes.includes(SNAPSHOT_TYPES.RESPONSE_DATA)) {
          cy.wrap(response.body).snapshot({ name: SNAPSHOT_TYPES.RESPONSE_DATA });
        }
      });

      if (snapshotTypes.includes(SNAPSHOT_TYPES.HTML)) {
        cy.findByTestId('enlarged-dialog').as('enlargedDialog');
        cy.get('@enlargedDialog').snapshotHtml({ name: SNAPSHOT_TYPES.HTML });
      }
    });
  });
});
