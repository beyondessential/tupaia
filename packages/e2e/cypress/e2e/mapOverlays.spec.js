import { groupBy } from 'es-toolkit/compat';

import config from '../__generatedConfig.json';
import { SNAPSHOT_TYPES } from '../constants';
import { preserveUserSession } from '../support';

const getResponseData = response => {
  const { measureData, ...data } = response.body;

  if (Array.isArray(measureData)) {
    // Item order in `measureData` is neither guaranteed nor important.
    // Group them by org unit for more robust data checking
    data.e2e_groupedMeasureData = groupBy(measureData, 'organisationUnitCode');
  }

  return data;
};

const assertUrlResponseHasData = (url, response) => {
  const hasData = response.body?.measureData?.length > 0;
  if (!hasData) {
    throw new Error(`Overlay with url "${url}" has no data`);
  }
};

const urlToRouteRegex = url => {
  const queryParams = url.split('?').slice(1).join('');
  const mapOverlayCode = new URLSearchParams(queryParams).get('overlay');
  if (!mapOverlayCode) {
    throw new Error(`'${url}' is not a valid report url: it must contain a 'report' query param`);
  }

  // Allows responses for both versions of the frontend
  return new RegExp(
    `(measureData\\?(.*&|)mapOverlayCode=${mapOverlayCode}(&|$)|legacyMapOverlayReport/${mapOverlayCode})`,
  );
};

describe('Map overlays', () => {
  const { allowEmptyResponse, snapshotTypes, urls } = config.mapOverlays;

  before(() => {
    cy.login();
  });

  beforeEach(() => {
    preserveUserSession();
  });

  urls.forEach(url => {
    it(url, () => {
      cy.server();
      cy.route(urlToRouteRegex(url)).as('overlay');
      cy.visit(url);

      cy.wait('@overlay').then(({ response }) => {
        if (!allowEmptyResponse) {
          assertUrlResponseHasData(url, response);
        }
        if (snapshotTypes.includes(SNAPSHOT_TYPES.RESPONSE_DATA)) {
          const responseData = getResponseData(response);
          cy.wrap(responseData).snapshot({ name: SNAPSHOT_TYPES.RESPONSE_DATA });
        }
      });
    });
  });
});
