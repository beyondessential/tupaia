/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import config from '../__generatedConfig.json';
import { SNAPSHOT_TYPES } from '../constants';
import { preserveUserSession } from '../support';

const assertUrlResponseHasData = (url, response) => {
  const hasData = response.body?.measureData?.length > 0;
  if (!hasData) {
    throw new Error(`Overlay with url "${url}" has no data`);
  }
};

const urlToRouteRegex = url => {
  const queryParams = url.split('?').slice(1).join('');
  const measureId = new URLSearchParams(queryParams).get('overlay');
  if (!measureId) {
    throw new Error(`'${url}' is not a valid report url: it must contain a 'report' query param`);
  }

  return new RegExp(`measureData?.*\\WmeasureId=${measureId}[&$]`);
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
        if (snapshotTypes.includes(SNAPSHOT_TYPES.RESPONSE_BODY)) {
          cy.wrap(response.body).as('responseBody');
          cy.get('@responseBody').snapshot({ name: SNAPSHOT_TYPES.RESPONSE_BODY });
        }
      });
    });
  });
});
