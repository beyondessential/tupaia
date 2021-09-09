/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { getTestDatabase } from '@tupaia/database';
import { dateStringToPeriod } from '@tupaia/utils';

import { TupaiaDataApi } from '../TupaiaDataApi';
import {
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
  CROP_RESPONSE_WELLINGTON_2019,
} from './TupaiaDataApi.fixtures';
import { testFetchAnalyticsAggregations } from './aggregations';

const getAnalyticsFromResponses = (responses, dataElementsToInclude, periodType) => {
  const analytics = [];
  responses.forEach(r => {
    Object.entries(r.answers)
      .filter(([questionCode]) => dataElementsToInclude.includes(questionCode))
      .forEach(([questionCode, answer]) => {
        analytics.push({
          dataElement: questionCode,
          organisationUnit: r.entityCode,
          value: isNaN(answer) ? answer : parseFloat(answer),
          period: dateStringToPeriod(r.data_time, periodType),
        });
      });
  });
  return analytics;
};

export const testFetchAnalytics = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  const assertCorrectResponse = async (
    options,
    responses,
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
    const testData = [
      [undefined, /provide options/],
      [null, /provide options/],
      [{}, /Invalid content/],
      [{ dataElementCodes: ['BCD1TEST', 'BCD325TEST'] }, /Invalid content.*organisationUnitCodes/], // no organisationUnitCodes
      [{ organisationUnitCodes: ['NZ_AK', 'NZ_WG'] }, /Invalid content.*dataElementCodes/], // no dataElementCodes
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST'],
          startDate: 'January first, 2020',
        },
        /Invalid content.*startDate/,
      ], // invalid startDate format
    ];
    for (const [options, expectedError] of testData) {
      await expect(api.fetchAnalytics(options)).toBeRejectedWith(expectedError);
    }
  });

  it('returns results in the correct format', async () => {
    const testData = [
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
    const testData = [
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
    const testData = [
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
    const testData = [
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

  describe('aggregation', testFetchAnalyticsAggregations(assertCorrectResponse));
};
