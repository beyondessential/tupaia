/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { createDhisApi } from './helpers';
import * as BuildAnalyticsQuery from '../../buildAnalyticsQuery';

const PROGRAM = { code: 'PROGRAM_CODE', id: 'program_dhisId' };

const inputQuery = {
  programCode: PROGRAM.code,
  organisationUnitCodes: ['TO', 'PG'],
};
const eventAnalyticsQuery = {
  programCode: PROGRAM.code,
  dimension: ['ou:TO;PG'],
};
const dhisEventAnalyticsResults = {
  headers: {},
  rows: [],
};

const fetchStub = sinon.stub();
fetchStub
  .withArgs(`analytics/events/query/${PROGRAM.id}`, eventAnalyticsQuery)
  .resolves(dhisEventAnalyticsResults)
  .withArgs('programs', {
    fields: sinon.match.array.contains(['id']),
    filter: { code: PROGRAM.code },
  })
  .resolves({ programs: [{ id: PROGRAM.id }] });

const dhisApi = createDhisApi({
  fetch: fetchStub,
});

export const testGetEventAnalytics = () => {
  before(() => {
    sinon
      .stub(BuildAnalyticsQuery, 'buildEventAnalyticsQuery')
      .withArgs(dhisApi, inputQuery)
      .resolves(eventAnalyticsQuery);
  });

  after(() => {
    BuildAnalyticsQuery.buildEventAnalyticsQuery.restore();
  });

  it('invokes the DHIS api with correct args, and returns the results', async () => {
    return expect(dhisApi.getEventAnalytics(inputQuery)).to.eventually.deep.equal(
      dhisEventAnalyticsResults,
    );
  });
};
