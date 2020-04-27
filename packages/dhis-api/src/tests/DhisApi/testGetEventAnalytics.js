/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import * as BuildAnalyticsQuery from '../../buildAnalyticsQuery';
import { createDhisApi } from './helpers';
import {
  DATA_ELEMENTS,
  ORGANISATION_UNITS,
  PROGRAM,
  QUERY,
  ANALYTICS_RESULTS,
} from './testGetEventAnalytics.fixtures';

const createFetchStub = () => {
  const fetchStub = sinon.stub();
  fetchStub
    .withArgs('programs', {
      fields: sinon.match.array.contains(['id']),
      filter: { code: PROGRAM.code },
    })
    .resolves({ programs: [{ id: PROGRAM.id }] })
    .withArgs('dataElements', {
      fields: sinon.match.array.contains(['id', 'code']),
      filter: {
        comparator: 'in',
        code: sinon.match.in([
          '[FEMALE_POPULATION,MALE_POPULATION]',
          '[MALE_POPULATION,FEMALE_POPULATION]',
        ]),
      },
    })
    .resolves({ dataElements: DATA_ELEMENTS })
    .withArgs('organisationUnits', {
      fields: sinon.match.array.contains(['id']),
      filter: {
        comparator: 'in',
        code: sinon.match.in(['[TO,PG]', '[PG,TO]']),
      },
    })
    .resolves({ organisationUnits: ORGANISATION_UNITS.map(({ id }) => ({ id })) })
    .withArgs(`analytics/events/query/${PROGRAM.id}`, QUERY.fetch, undefined)
    .resolves(ANALYTICS_RESULTS.raw);

  return fetchStub;
};

const dhisApi = createDhisApi({
  fetch: createFetchStub(),
});

export const testGetEventAnalytics = () => {
  before(() => {
    sinon.stub(BuildAnalyticsQuery, 'buildEventAnalyticsQuery').resolves(QUERY.fetch);
  });

  afterEach(() => {
    BuildAnalyticsQuery.buildEventAnalyticsQuery.resetHistory();
    dhisApi.fetcher.fetch.resetHistory();
  });

  after(() => {
    BuildAnalyticsQuery.buildEventAnalyticsQuery.restore();
  });

  it('translates codes to ids in the provided query', async () => {
    await dhisApi.getEventAnalytics(QUERY.originalInput);
    expect(BuildAnalyticsQuery.buildEventAnalyticsQuery).to.have.been.calledOnceWithExactly(
      sinon.match(QUERY.idsReplacedWithCodes),
    );
  });

  it('Invokes DhisFetcher.fetch() with the correct args', async () => {
    await dhisApi.getEventAnalytics(QUERY.originalInput);
    expect(dhisApi.fetcher.fetch).to.have.been.calledWithExactly(
      `analytics/events/query/${PROGRAM.id}`,
      QUERY.fetch,
      undefined,
    );
  });

  describe('dataElementIdScheme option', () => {
    it(`dataElementIdScheme = 'code': translates data element ids to codes in the results`, () =>
      expect(
        dhisApi.getEventAnalytics({ ...QUERY.originalInput, dataElementIdScheme: 'code' }),
      ).to.eventually.deep.equal(ANALYTICS_RESULTS.translatedDataElementIds));

    it(`dataElementIdScheme <> 'code': directly returns the results fetched by DHIS2`, () =>
      expect(
        dhisApi.getEventAnalytics({ ...QUERY.originalInput, dataElementIdScheme: 'uid' }),
      ).to.eventually.deep.equal(ANALYTICS_RESULTS.raw));

    it(`dataElementIdScheme is undefined: defaults to 'code'`, () =>
      expect(dhisApi.getEventAnalytics(QUERY.originalInput)).to.eventually.deep.equal(
        ANALYTICS_RESULTS.translatedDataElementIds,
      ));
  });
};
