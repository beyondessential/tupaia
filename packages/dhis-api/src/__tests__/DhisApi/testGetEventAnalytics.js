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
    .calledWith(
      'programs',
      {
        fields: expect.arrayContaining(['id']),
        filter: { code: PROGRAM.code },
      },
      undefined,
    )
    .mockResolvedValue({ programs: [{ id: PROGRAM.id }] })
    .calledWith(
      'dataElements',
      {
        fields: expect.arrayContaining(['id', 'code']),
        filter: {
          comparator: 'in',
          code: expect.toBeOneOf([
            '[FEMALE_POPULATION,MALE_POPULATION]',
            '[MALE_POPULATION,FEMALE_POPULATION]',
          ]),
        },
      },
      undefined,
    )
    .mockResolvedValue({ dataElements: DATA_ELEMENTS })
    .calledWith(
      'organisationUnits',
      {
        fields: expect.arrayContaining(['id']),
        filter: {
          comparator: 'in',
          code: expect.toBeOneOf(['[TO,PG]', '[PG,TO]']),
        },
      },
      undefined,
    )
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
    jest.spyOn(BuildAnalyticsQuery, 'buildEventAnalyticsQueries').mockResolvedValue([QUERY.fetch]);
  });

  it('translates codes to ids in the provided query', async () => {
    await dhisApi.getEventAnalytics(QUERY.originalInput);
    return expect(BuildAnalyticsQuery.buildEventAnalyticsQueries).toHaveBeenCalledOnceWith(
      QUERY.idsReplacedWithCodes,
    );
  });

  it('does not translate codes to ids if ids are provided', async () => {
    // Some dhis configurations do not have codes against their data elements or programs etc. The way
    // to work with these is to send ids instead, and if we specify ids we must make sure not to attempt
    // to retrieve ids from the codes we pass in (because they will be not be defined).
    await dhisApi.getEventAnalytics({
      ...QUERY.originalInput,
      ...{
        programId: ['program_dhisId'],
        dataElementIds: ['femalePopulation_dhisId', 'malePopulation_dhisId'],
        organisationUnitIds: ['to_dhisId', 'pg_dhisId'],
        dataElementIdScheme: 'id', // prevent conversion after the main api call to allow for accurate test
      },
    });
    // fetcher being called once means fetch(dataElements), fetch(orgUnits) has not been called
    return expect(dhisApi.fetcher.fetch).toHaveBeenCalledOnceWith(
      'analytics/events/query/program_dhisId',
      QUERY.fetch,
      undefined,
    );
  });

  it('Invokes DhisFetcher.fetch() with the correct args', async () => {
    await dhisApi.getEventAnalytics(QUERY.originalInput);
    return expect(dhisApi.fetcher.fetch).toHaveBeenCalledWith(
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
