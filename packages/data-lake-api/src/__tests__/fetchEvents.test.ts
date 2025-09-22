import groupBy from 'lodash.groupby';
import { DataLakeApi } from '../DataLakeApi';
import {
  Analytic,
  ALL_ANALYTICS,
  TONGA_ANALYTICS,
  PNG_ANALYTICS,
  TWENTY_TWENTY_ANALYTICS,
} from './testData/fixtures';
import { getTestWriteDatabase, clearTestData, importTestData } from './utilities';
import { DataElement } from '@tupaia/types';

const getEventsFromAnalytics = (analytics: Analytic[], dataElementsToInclude: string[] = []) => {
  const analyticsById = groupBy(analytics, 'event_id');
  const events = Object.values(analyticsById).map(analyticGroup => {
    const analytic = analyticGroup[0];
    const dataValues = analyticGroup
      .filter(({ data_element_code }) => dataElementsToInclude.includes(data_element_code))
      .reduce<Record<DataElement['code'], string | number>>(
        (values, { data_element_code, value }) => {
          values[data_element_code] = Number.isNaN(value) ? value : Number.parseFloat(value);
          return values;
        },
        {},
      );

    return {
      event: analytic.event_id,
      orgUnit: analytic.entity_code,
      orgUnitName: '',
      eventDate: analytic.date,
      dataValues,
    };
  });

  if (dataElementsToInclude.length > 0) {
    // Ensure event has atleast one answer for requested data_elements
    return events.filter(event => Object.keys(event.dataValues).length > 0);
  }

  return events;
};

describe('fetchEvents', () => {
  const api = new DataLakeApi();

  const assertCorrectResponse = async (options: Record<string, any>, analytics: Analytic[]) =>
    expect(api.fetchEvents(options)).resolves.toStrictEqual(
      getEventsFromAnalytics(analytics, options.dataElementCodes),
    );

  beforeAll(async () => {
    await importTestData(getTestWriteDatabase(), ALL_ANALYTICS);
  });

  afterAll(async () => {
    await clearTestData(getTestWriteDatabase());
  });

  it('throws an error with invalid parameters', async () => {
    const testData: [Record<string, any>, RegExp][] = [
      [{}, /dataGroupCode is a required field/],
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
        },
        /dataGroupCode is a required field/,
      ], // no dataGroupCode
      [
        {
          dataGroupCode: 'BCDTEST',
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
        },
        /organisationUnitCodes is a required field/,
      ], // no organisationUnitCodes
      [
        {
          dataGroupCode: 'BCDTEST',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 1],
        },
        /dataElementCodes\[1\] must be a `string` type, but the final value was: `1`*/,
      ],
      [
        {
          dataGroupCode: 'BCDTEST',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
          startDate: 'January first, 2020',
        },
        /startDate should be in ISO 8601 format/,
      ], // invalid startDate format
    ];

    for (const [options, expectedRegexp] of testData) {
      await expect(api.fetchEvents(options)).toBeRejectedWith(expectedRegexp);
    }
  });

  it('returns results in the correct format, sorted by event date', async () => {
    const options = {
      dataGroupCode: 'cool_survey',
      organisationUnitCodes: ['TO', 'PG'],
      dataElementCodes: ['question_A', 'question_B'],
    };
    const responses = ALL_ANALYTICS;
    await assertCorrectResponse(options, responses);
  });

  it('filters results if they have no answer to desired data_element_codes', async () => {
    const options = {
      dataGroupCode: 'cool_survey',
      organisationUnitCodes: ['TO', 'PG'],
      dataElementCodes: ['question_A'],
    };
    const responses = ALL_ANALYTICS;
    await assertCorrectResponse(options, responses);
  });

  it('includes empty data values if no data elements are specified', async () => {
    const options = {
      dataGroupCode: 'cool_survey',
      organisationUnitCodes: ['TO'],
    };
    const responses = [...TONGA_ANALYTICS];
    await assertCorrectResponse(options, responses);
  });

  it('should limit results by organisation unit codes', async () => {
    const options = {
      dataGroupCode: 'cool_survey',
      organisationUnitCodes: ['PG'],
    };
    const responses = [...PNG_ANALYTICS];
    await assertCorrectResponse(options, responses);
  });

  it('should limit results by start and end dates', async () => {
    const options = {
      dataGroupCode: 'cool_survey',
      organisationUnitCodes: ['TO', 'PG'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    };
    const responses = [...TWENTY_TWENTY_ANALYTICS];
    await assertCorrectResponse(options, responses);
  });

  it('should limit results when an event id is passed in', async () => {
    await assertCorrectResponse(
      {
        dataGroupCode: 'cool_survey',
        organisationUnitCodes: ['TO', 'PG'],
        dataElementCodes: ['question_A', 'question_B'],
        eventId: TONGA_ANALYTICS[1].event_id,
      },
      [TONGA_ANALYTICS[1]],
    );
  });
});
