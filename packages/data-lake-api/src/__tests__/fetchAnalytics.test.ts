import { dateStringToPeriod } from '@tupaia/utils';
import { DataLakeApi } from '../DataLakeApi';
import {
  Analytic,
  ALL_ANALYTICS,
  PNG_ANALYTICS,
  TWENTY_TWENTY_ANALYTICS,
} from './testData/fixtures';
import { getTestWriteDatabase, clearTestData, importTestData } from './utilities';

const formatAnalytics = (inputAnalytics: Analytic[]) =>
  inputAnalytics.map(({ entity_code, data_element_code, date, value }) => ({
    organisationUnit: entity_code,
    dataElement: data_element_code,
    period: dateStringToPeriod(date, 'DAY'),
    value: isNaN(value as any) ? value : parseFloat(value),
  }));

describe('fetchAnalytics', () => {
  const api = new DataLakeApi();

  const assertCorrectResponse = async (options: Record<string, any>, analytics: Analytic[]) =>
    expect(api.fetchAnalytics(options)).resolves.toStrictEqual({
      analytics: formatAnalytics(analytics),
      numAggregationsProcessed: 0,
    });

  beforeAll(async () => {
    await importTestData(getTestWriteDatabase(), ALL_ANALYTICS);
  });

  afterAll(async () => {
    await clearTestData(getTestWriteDatabase());
  });

  it('throws an error with invalid parameters', async () => {
    const testData: [Record<string, any>, RegExp][] = [
      [{}, /dataElementCodes is a required field/],
      [
        { dataElementCodes: ['BCD1TEST', 'BCD325TEST'] },
        /organisationUnitCodes is a required field/,
      ], // no organisationUnitCodes
      [{ organisationUnitCodes: ['NZ_AK', 'NZ_WG'] }, /dataElementCodes is a required field/], // no dataElementCodes
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
          startDate: 'January first, 2020',
        },
        /startDate should be in ISO 8601 format/,
      ],
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST', 1],
        },
        /dataElementCodes\[2\] must be a `string` type, but the final value was: `1`*/,
      ],
    ];

    for (const [options, expectedRegexp] of testData) {
      await expect(api.fetchAnalytics(options)).toBeRejectedWith(expectedRegexp);
    }
  });

  it('returns results in the correct format, sorted by event date', async () => {
    const options = {
      organisationUnitCodes: ['TO', 'PG'],
      dataElementCodes: ['question_A', 'question_B'],
    };
    const responses = ALL_ANALYTICS;
    await assertCorrectResponse(options, responses);
  });

  it('filters by data element code', async () => {
    const options = {
      organisationUnitCodes: ['TO', 'PG'],
      dataElementCodes: ['question_A'],
    };
    const responses = ALL_ANALYTICS.filter(
      ({ data_element_code }) => data_element_code === 'question_A',
    );
    await assertCorrectResponse(options, responses);
  });

  it('filters by org unit code', async () => {
    const options = {
      organisationUnitCodes: ['PG'],
      dataElementCodes: ['question_A', 'question_B'],
    };
    const responses = [...PNG_ANALYTICS];
    await assertCorrectResponse(options, responses);
  });

  it('filters by start and end dates', async () => {
    const options = {
      organisationUnitCodes: ['TO', 'PG'],
      dataElementCodes: ['question_A', 'question_B'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    };
    const responses = [...TWENTY_TWENTY_ANALYTICS];
    await assertCorrectResponse(options, responses);
  });
});
