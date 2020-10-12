/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

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
  const fetchStub = jest.fn();
  when(fetchStub)
    .calledWith('programs', {
      fields: expect.arrayContaining(['id']),
      filter: { code: PROGRAM.code },
    })
    .mockResolvedValue({ programs: [{ id: PROGRAM.id }] })
    .calledWith('dataElements', {
      fields: expect.arrayContaining(['id', 'code']),
      filter: {
        comparator: 'in',
        code: expect.toBeOneOf([
          '[FEMALE_POPULATION,MALE_POPULATION]',
          '[MALE_POPULATION,FEMALE_POPULATION]',
        ]),
      },
    })
    .mockResolvedValue({ dataElements: DATA_ELEMENTS })
    .calledWith('organisationUnits', {
      fields: expect.arrayContaining(['id']),
      filter: {
        comparator: 'in',
        code: expect.toBeOneOf(['[TO,PG]', '[PG,TO]']),
      },
    })
    .mockResolvedValue({ organisationUnits: ORGANISATION_UNITS.map(({ id }) => ({ id })) })
    .calledWith(`analytics/events/query/${PROGRAM.id}`, QUERY.fetch, undefined)
    .mockResolvedValue(ANALYTICS_RESULTS.raw);

  return fetchStub;
};

const dhisApi = createDhisApi({
  fetch: createFetchStub(),
});

export const testGetEventAnalytics = () => {
  beforeAll(() => {
    jest.spyOn(BuildAnalyticsQuery, 'buildEventAnalyticsQuery').mockResolvedValue(QUERY.fetch);
  });

  it('translates codes to ids in the provided query', async () => {
    await dhisApi.getEventAnalytics(QUERY.originalInput);
    expect(BuildAnalyticsQuery.buildEventAnalyticsQuery).toHaveBeenCalledOnceWith(
      QUERY.idsReplacedWithCodes,
    );
  });

  it('Invokes DhisFetcher.fetch() with the correct args', async () => {
    await dhisApi.getEventAnalytics(QUERY.originalInput);
    expect(dhisApi.fetcher.fetch).toHaveBeenCalledWith(
      `analytics/events/query/${PROGRAM.id}`,
      QUERY.fetch,
      undefined,
    );
  });

  describe('dataElementIdScheme option', () => {
    it(`dataElementIdScheme = 'code': translates data element ids to codes in the results`, () =>
      expect(
        dhisApi.getEventAnalytics({ ...QUERY.originalInput, dataElementIdScheme: 'code' }),
      ).resolves.toStrictEqual(ANALYTICS_RESULTS.translatedDataElementIds));

    it(`dataElementIdScheme <> 'code': directly returns the results fetched by DHIS2`, () =>
      expect(
        dhisApi.getEventAnalytics({ ...QUERY.originalInput, dataElementIdScheme: 'uid' }),
      ).resolves.toStrictEqual(ANALYTICS_RESULTS.raw));

    it(`dataElementIdScheme is undefined: defaults to 'code'`, () =>
      expect(dhisApi.getEventAnalytics(QUERY.originalInput)).resolves.toStrictEqual(
        ANALYTICS_RESULTS.translatedDataElementIds,
      ));
  });
};
