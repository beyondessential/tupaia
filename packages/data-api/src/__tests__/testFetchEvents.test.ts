import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';
import {
  SurveyResponse,
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
  CROP_RESPONSE_WELLINGTON_2019,
} from './TupaiaDataApi.fixtures';

const getEventsFromResponses = (
  responses: SurveyResponse[],
  dataElementsToInclude: string[] = [],
) =>
  responses.map(r => ({
    event: r.id,
    orgUnit: r.entityCode,
    orgUnitName: r.entityCode === 'NZ_AK' ? 'Auckland' : 'Wellington',
    eventDate: r.data_time,
    dataValues: Object.entries(r.answers)
      .filter(([code]) => dataElementsToInclude.includes(code))
      .reduce((values, [code, answer]) => {
        values[code] = isNaN(answer as any) ? answer : parseFloat(answer);
        return values;
      }, {}),
  }));

describe('fetchEvents()', () => {
  const api = new TupaiaDataApi(getTestDatabase());

  const assertCorrectResponse = async (options: Record<string, any>, responses: SurveyResponse[]) =>
    expect(api.fetchEvents(options)).resolves.toStrictEqual(
      getEventsFromResponses(responses, options.dataElementCodes),
    );

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
        /dataElementCodes*/,
      ], // data element code is not a string
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
    const testData: [Record<string, any>, SurveyResponse[]][] = [
      [
        {
          dataGroupCode: 'BCDTEST',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
        },
        [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
      ],
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019, CROP_RESPONSE_AUCKLAND_2020],
      ],
    ];
    for (const [options, responses] of testData) {
      await assertCorrectResponse(options, responses);
    }
  });

  it('includes empty data values if no data elements are specified', async () => {
    const options = {
      dataGroupCode: 'BCDTEST',
      organisationUnitCodes: ['NZ_AK'],
    };
    const responses = [BCD_RESPONSE_AUCKLAND];
    await assertCorrectResponse(options, responses);
  });

  it('should limit results by data element codes', async () => {
    const testData: [Record<string, any>, SurveyResponse[]][] = [
      [
        {
          dataGroupCode: 'BCDTEST',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST'],
        },
        [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
      ],
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_2'],
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019, CROP_RESPONSE_AUCKLAND_2020],
      ],
    ];
    for (const [options, responses] of testData) {
      await assertCorrectResponse(options, responses);
    }
  });

  it('should limit results by organisation unit codes', async () => {
    const testData: [Record<string, any>, SurveyResponse[]][] = [
      [
        {
          dataGroupCode: 'BCDTEST',
          organisationUnitCodes: ['NZ_AK'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
        },
        [BCD_RESPONSE_AUCKLAND],
      ],
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
        },
        [CROP_RESPONSE_WELLINGTON_2019],
      ],
    ];
    for (const [options, responses] of testData) {
      await assertCorrectResponse(options, responses);
    }
  });

  it('should limit results by start and end dates', async () => {
    const testData: [Record<string, any>, SurveyResponse[]][] = [
      // start date only
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          startDate: '2020-01-01',
        },
        [CROP_RESPONSE_AUCKLAND_2020],
      ],
      // end date only
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          endDate: '2019-12-31',
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019],
      ],
      // start and end dates
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          startDate: '2019-12-01',
          endDate: '2019-12-31',
        },
        [CROP_RESPONSE_WELLINGTON_2019],
      ],
      // start and end dates, check inclusivity of start date
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          startDate: '2019-11-21',
          endDate: '2019-12-31',
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019],
      ],
      // start and end dates, check inclusivity of end date
      [
        {
          dataGroupCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          startDate: '2019-12-01',
          endDate: '2020-11-21',
        },
        [CROP_RESPONSE_WELLINGTON_2019, CROP_RESPONSE_AUCKLAND_2020],
      ],
    ];
    for (const [options, responses] of testData) {
      await assertCorrectResponse(options, responses);
    }
  });

  it('should limit results when an event id is passed in', async () => {
    await assertCorrectResponse(
      {
        dataGroupCode: 'CROP',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        eventId: CROP_RESPONSE_AUCKLAND_2019.id,
      },
      [CROP_RESPONSE_AUCKLAND_2019],
    );
  });

  it('should limit results by a combination of parameters', async () => {
    await assertCorrectResponse(
      {
        dataGroupCode: 'CROP',
        organisationUnitCodes: ['NZ_AK'],
        dataElementCodes: ['CROP_1'],
        startDate: '2019-01-01',
        endDate: '2020-01-01',
      },
      [CROP_RESPONSE_AUCKLAND_2019],
    );
  });
});
