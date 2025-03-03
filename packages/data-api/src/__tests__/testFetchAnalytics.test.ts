import { getTestDatabase } from '@tupaia/database';
import { dateStringToPeriod } from '@tupaia/utils';

import { TupaiaDataApi } from '../TupaiaDataApi';
import {
  SurveyResponse,
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
  CROP_RESPONSE_WELLINGTON_2019,
  CITY_TO_COUNTRY_MAP,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
  KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
  KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
  KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
  KITTY_RESPONSE_WELLINGTON_MORNING_20220606W23,
  KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23,
  KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
  KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23,
} from './TupaiaDataApi.fixtures';

const getAnalyticsFromResponses = (
  responses: SurveyResponse[],
  dataElementsToInclude: string[],
  periodType: string,
) => {
  const analytics: {
    dataElement: string;
    organisationUnit: string;
    value: string | number;
    period: string;
  }[] = [];
  responses.forEach(r => {
    Object.entries(r.answers)
      .filter(([questionCode]) => dataElementsToInclude.includes(questionCode))
      .forEach(([questionCode, answer]) => {
        analytics.push({
          dataElement: questionCode,
          organisationUnit: r.entityCode,
          value: Number.isNaN(answer as any) ? answer : Number.parseFloat(answer),
          period: dateStringToPeriod(r.data_time, periodType),
        });
      });
  });
  return analytics;
};

const setResponseEntityCode = (response: SurveyResponse, entityCode: string) => ({
  ...response,
  entityCode,
});

describe('fetchAnalytics()', () => {
  const api = new TupaiaDataApi(getTestDatabase());

  const assertCorrectResponse = async (
    options: Record<string, any>,
    responses: SurveyResponse[],
    expectedNumAggregationsProcessed = 0,
    expectedPeriodType = 'DAY',
  ) => {
    const { analytics, numAggregationsProcessed } = await api.fetchAnalytics(options);
    expect(analytics).toIncludeSameMembers(
      getAnalyticsFromResponses(responses, options.dataElementCodes, expectedPeriodType),
    );
    expect(numAggregationsProcessed).toEqual(expectedNumAggregationsProcessed);
  };

  it('throws an error with invalid parameters', async () => {
    const testData: [Record<string, unknown>, RegExp][] = [
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
        /dataElementCodes*/,
      ],
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
          aggregations: ['FINAL_EACH_DAY', 1],
        },
        /aggregations\[1\]*/,
      ],
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
          aggregations: ['FINAL_EACH_DAY', { type: 1 }],
        },
        /aggregations\[1\]*/,
      ],
    ];
    for (const [options, expectedError] of testData) {
      await expect(api.fetchAnalytics(options)).toBeRejectedWith(expectedError);
    }
  });

  it('returns results in the correct format', async () => {
    const testData: [Record<string, string | string[]>, SurveyResponse[]][] = [
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
        },
        [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
      ],
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_AUCKLAND_2020, CROP_RESPONSE_WELLINGTON_2019],
      ],
    ];

    for (const [options, responses] of testData) {
      await assertCorrectResponse(options, responses);
    }
  });

  it('should limit results by data element codes', async () => {
    const testData: [Record<string, string | string[]>, SurveyResponse[]][] = [
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST'],
        },
        [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
      ],
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_2'],
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_AUCKLAND_2020, CROP_RESPONSE_WELLINGTON_2019],
      ],
    ];

    for (const [options, responses] of testData) {
      await assertCorrectResponse(options, responses);
    }
  });

  it('should limit results by organisation unit codes', async () => {
    const testData: [Record<string, string | string[]>, SurveyResponse[]][] = [
      [
        {
          organisationUnitCodes: ['NZ_AK'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
        },
        [BCD_RESPONSE_AUCKLAND],
      ],
      [
        {
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
    const testData: [Record<string, string | string[]>, SurveyResponse[]][] = [
      // start date only
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          startDate: '2020-01-01',
        },
        [CROP_RESPONSE_AUCKLAND_2020],
      ],
      // end date only
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          endDate: '2019-12-31',
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019],
      ],
      // start and end dates
      [
        {
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

  it('should limit results by a combination of parameters', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK'],
        dataElementCodes: ['CROP_1'],
        startDate: '2019-01-01',
        endDate: '2020-01-01',
      },
      [CROP_RESPONSE_AUCKLAND_2019],
    );
  });

  describe('aggregation', () => {
    const sumAnswers = (answerCode: string, responses: SurveyResponse[]) =>
      `${Number(
        responses
          .reduce(
            (sum, { answers }) =>
              sum + (answers[answerCode] ? Number.parseFloat(answers[answerCode]) : 0),
            0,
          )
          .toFixed(1),
      )}`; // round off floating point math issues

    it('should not perform any aggregation if an unsupported aggregation is supplied', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'SUM' }],
        },
        [
          KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
          KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });

    it('should not perform any aggregation if an unsupported aggregation config is supplied', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'FINAL_EACH_WEEK', config: { fillEmptyPeriodsWith: 'previous' } }],
        },
        [
          KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
          KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });

    it('should not perform any aggregation if the first aggregation is not supported', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'OFFSET_PERIOD' }, { type: 'FINAL_EACH_YEAR' }],
        },
        [
          KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
          KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });

    it('should return correct results when no start date or end date are specified', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['KITTY_1', 'KITTY_2'],
          aggregations: [{ type: 'FINAL_EACH_MONTH' }],
        },
        [
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23,
          KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23,
        ],
        1,
        'MONTH',
      );
    });

    it('should return correct results when requested period does not land on period type boundary', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_WG'],
          dataElementCodes: ['KITTY_1', 'KITTY_2'],
          startDate: '2021-01-01',
          endDate: '2021-01-04',
          aggregations: [{ type: 'FINAL_EACH_WEEK' }],
        },
        [KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1],
        1,
        'WEEK',
      );
    });

    describe('FINAL_EACH_DAY', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
            startDate: '2019-01-01',
            endDate: '2022-01-01',
            aggregations: [{ type: 'FINAL_EACH_DAY' }],
          },
          [
            CROP_RESPONSE_AUCKLAND_2019,
            CROP_RESPONSE_WELLINGTON_2019,
            BCD_RESPONSE_AUCKLAND,
            BCD_RESPONSE_WELLINGTON,
            CROP_RESPONSE_AUCKLAND_2020,
            KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
            KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
            KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          ],
          1,
        );
      });
    });

    describe('FINAL_EACH_WEEK', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
            startDate: '2019-01-01',
            endDate: '2022-01-01',
            aggregations: [{ type: 'FINAL_EACH_WEEK' }],
          },
          [
            CROP_RESPONSE_AUCKLAND_2019,
            CROP_RESPONSE_WELLINGTON_2019,
            BCD_RESPONSE_AUCKLAND,
            BCD_RESPONSE_WELLINGTON,
            CROP_RESPONSE_AUCKLAND_2020,
            KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
            KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          ],
          1,
          'WEEK',
        );
      });
    });

    describe('FINAL_EACH_MONTH', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
            startDate: '2019-01-01',
            endDate: '2022-01-01',
            aggregations: [{ type: 'FINAL_EACH_MONTH' }],
          },
          [
            CROP_RESPONSE_AUCKLAND_2019,
            CROP_RESPONSE_WELLINGTON_2019,
            BCD_RESPONSE_AUCKLAND,
            BCD_RESPONSE_WELLINGTON,
            CROP_RESPONSE_AUCKLAND_2020,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
            KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          ],
          1,
          'MONTH',
        );
      });
    });

    describe('FINAL_EACH_YEAR', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
            startDate: '2019-01-01',
            endDate: '2022-01-01',
            aggregations: [{ type: 'FINAL_EACH_YEAR' }],
          },
          [
            CROP_RESPONSE_AUCKLAND_2019,
            CROP_RESPONSE_WELLINGTON_2019,
            BCD_RESPONSE_AUCKLAND,
            BCD_RESPONSE_WELLINGTON,
            CROP_RESPONSE_AUCKLAND_2020,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
            KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          ],
          1,
          'YEAR',
        );
      });
    });

    describe('MOST_RECENT', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        const CROP_RESPONSE_AUCKLAND_2019_SANS_CROP2 = {
          ...CROP_RESPONSE_AUCKLAND_2019,
          answers: {
            CROP_1: CROP_RESPONSE_AUCKLAND_2019.answers.CROP_1,
          },
        };
        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
            startDate: '2019-01-01',
            endDate: '2022-01-01',
            aggregations: [{ type: 'MOST_RECENT' }],
          },
          [
            CROP_RESPONSE_WELLINGTON_2019,
            CROP_RESPONSE_AUCKLAND_2019_SANS_CROP2,
            BCD_RESPONSE_AUCKLAND,
            BCD_RESPONSE_WELLINGTON,
            CROP_RESPONSE_AUCKLAND_2020,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
            KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          ],
          1,
        );
      });
    });

    describe('MOST_RECENT_PER_ORG_GROUP', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        // crop 2 will come from Auckland's more recent 2020 response, but as that doesn't contain crop 1, get
        // that from Wellington's next most recent 2019 response
        const CROP_RESPONSE_WELLINGTON_2019_SANS_CROP_2 = {
          ...CROP_RESPONSE_WELLINGTON_2019,
          answers: {
            CROP_1: CROP_RESPONSE_WELLINGTON_2019.answers.CROP_1,
          },
        };
        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
            aggregations: [
              { type: 'MOST_RECENT_PER_ORG_GROUP', config: { orgUnitMap: CITY_TO_COUNTRY_MAP } },
            ],
          },
          [
            setResponseEntityCode(BCD_RESPONSE_WELLINGTON, 'NZ'),
            setResponseEntityCode(CROP_RESPONSE_WELLINGTON_2019_SANS_CROP_2, 'NZ'),
            setResponseEntityCode(CROP_RESPONSE_AUCKLAND_2020, 'NZ'),
            setResponseEntityCode(KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23, 'NZ'),
          ],
          1,
        );
      });
    });

    describe('SUM_PER_ORG_GROUP', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        const cropResponses = [
          CROP_RESPONSE_AUCKLAND_2019,
          CROP_RESPONSE_AUCKLAND_2020,
          CROP_RESPONSE_WELLINGTON_2019,
        ];

        const crop1SummedResponse = {
          ...CROP_RESPONSE_AUCKLAND_2019, // doesn't matter which, just using as a base
          data_time: CROP_RESPONSE_WELLINGTON_2019.data_time, // most recent data time for a CROP_1 answer
          answers: {
            CROP_1: sumAnswers('CROP_1', cropResponses),
          },
        };

        const crop2SummedResponse = {
          ...CROP_RESPONSE_AUCKLAND_2019, // doesn't matter which, just using as a base
          data_time: CROP_RESPONSE_AUCKLAND_2020.data_time, // most recent data time for a CROP_2 answer
          answers: {
            CROP_2: sumAnswers('CROP_2', cropResponses),
          },
        };

        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['CROP_1', 'CROP_2'],
            aggregations: [
              { type: 'SUM_PER_ORG_GROUP', config: { orgUnitMap: CITY_TO_COUNTRY_MAP } },
            ],
          },
          [
            setResponseEntityCode(crop1SummedResponse, 'NZ'),
            setResponseEntityCode(crop2SummedResponse, 'NZ'),
          ],
          1,
        );
      });
    });

    describe('SUM_PER_PERIOD_PER_ORG_GROUP', () => {
      it('should return correct results across a number of data_elements, entities, and periods', async () => {
        const makeSummedResponse = (responsesFromSameDate: SurveyResponse[]) => {
          const summedResponse = {
            ...responsesFromSameDate[0],
            answers: {
              KITTY_1: sumAnswers('KITTY_1', responsesFromSameDate),
              KITTY_2: sumAnswers('KITTY_2', responsesFromSameDate),
            },
          };
          return setResponseEntityCode(summedResponse, 'NZ');
        };

        const kitty20210104SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
          KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
        ]);

        const kitty20210105SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
        ]);

        const kitty20210113SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
        ]);
        const kitty20210115SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
        ]);
        const kitty20210205SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
        ]);
        const kitty20210608SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ]);
        const kitty20210219SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
        ]);
        const kitty20220606SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20220606W23,
        ]);
        const kitty20220608SummedResponse = makeSummedResponse([
          KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23,
          KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23,
        ]);

        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['KITTY_1', 'KITTY_2'],
            aggregations: [
              { type: 'SUM_PER_PERIOD_PER_ORG_GROUP', config: { orgUnitMap: CITY_TO_COUNTRY_MAP } },
            ],
          },
          [
            kitty20210104SummedResponse,
            kitty20210105SummedResponse,
            kitty20210113SummedResponse,
            kitty20210115SummedResponse,
            kitty20210205SummedResponse,
            kitty20210219SummedResponse,
            kitty20210608SummedResponse,
            kitty20220606SummedResponse,
            kitty20220608SummedResponse,
          ],
          1,
        );
      });
    });

    describe('chained aggregations', () => {
      it('should only perform chain up to last supported aggregation', async () => {
        await assertCorrectResponse(
          {
            organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
            dataElementCodes: ['KITTY_1', 'KITTY_2'],
            startDate: '2019-01-01',
            endDate: '2022-01-01',
            aggregations: [
              { type: 'FINAL_EACH_WEEK' },
              { type: 'SUM' },
              { type: 'FINAL_EACH_DAY' },
            ],
          },
          [
            KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
            KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
            KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          ],
          1,
          'WEEK',
        );
      });

      describe('FINAL_EACH_WEEK -> SUM_PER_PERIOD_PER_ORG_GROUP', () => {
        it('should return correct results across a number of data_elements, entities, and periods', async () => {
          const makeSummedResponse = (responsesFromSameDate: SurveyResponse[]) => {
            const summedResponse = {
              ...responsesFromSameDate[0],
              answers: {
                KITTY_1: sumAnswers('KITTY_1', responsesFromSameDate),
                KITTY_2: sumAnswers('KITTY_2', responsesFromSameDate),
              },
            };
            return setResponseEntityCode(summedResponse, 'NZ');
          };

          const kitty20210105SummedResponse = makeSummedResponse([
            KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
          ]);

          const kitty20210115SummedResponse = makeSummedResponse([
            KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          ]);
          const kitty20210205SummedResponse = makeSummedResponse([
            KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
          ]);
          const kitty20210608SummedResponse = makeSummedResponse([
            KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
          ]);
          const kitty20210219SummedResponse = makeSummedResponse([
            KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          ]);
          const kitty20220608SummedResponse = makeSummedResponse([
            KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23,
            KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23,
          ]);

          await assertCorrectResponse(
            {
              organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
              dataElementCodes: ['KITTY_1', 'KITTY_2'],
              aggregations: [
                { type: 'FINAL_EACH_WEEK' },
                {
                  type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
                  config: { orgUnitMap: CITY_TO_COUNTRY_MAP },
                },
              ],
            },
            [
              kitty20210105SummedResponse,
              kitty20210115SummedResponse,
              kitty20210205SummedResponse,
              kitty20210219SummedResponse,
              kitty20210608SummedResponse,
              kitty20220608SummedResponse,
            ],
            2,
            'WEEK',
          );
        });
      });
    });
  });
});
