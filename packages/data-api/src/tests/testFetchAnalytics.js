/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';
import {
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
  CROP_RESPONSE_WELLINGTON_2019,
} from './TupaiaDataApi.fixtures';

const getAnalyticsFromResponses = (responses, dataElementsToInclude) => {
  const analytics = [];
  responses.forEach(r => {
    Object.entries(r.answers)
      .filter(([questionCode]) => dataElementsToInclude.includes(questionCode))
      .forEach(([questionCode, answer]) => {
        analytics.push({
          dataElement: questionCode,
          organisationUnit: r.entityCode,
          value: isNaN(answer) ? answer : parseFloat(answer),
          date: r.submission_time.substring(0, 10), // just the YYYY-MM-DD bit
        });
      });
  });
  return analytics;
};

export const testFetchAnalytics = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  const assertCorrectResponse = async (options, responses) =>
    expect(api.fetchAnalytics(options)).to.eventually.deep.equalInAnyOrder(
      getAnalyticsFromResponses(responses, options.dataElementCodes),
    );

  it('throws an error with invalid parameters', async () => {
    await expect(api.fetchAnalytics()).to.be.rejectedWith(/provide options/);
    await expect(api.fetchAnalytics(null)).to.be.rejectedWith(/provide options/);
    await expect(api.fetchAnalytics({})).to.be.rejectedWith(/Invalid content/);

    // no organisationUnitCodes
    await expect(
      api.fetchAnalytics({
        dataElementCodes: ['BCD1', 'BCD325'],
      }),
    ).to.be.rejectedWith(/Invalid content.*organisationUnitCodes/);

    // no dataElementCodes
    await expect(
      api.fetchAnalytics({
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
      }),
    ).to.be.rejectedWith(/Invalid content.*dataElementCodes/);

    // invalid startDate format
    await expect(
      api.fetchAnalytics({
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['BCD1', 'BCD325'],
        startDate: 'January first, 2020',
      }),
    ).to.be.rejectedWith(/Invalid content.*startDate/);
  });

  it('returns results in the correct format', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['BCD1', 'BCD325'],
      },
      [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
    );
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
      },
      [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_AUCKLAND_2020, CROP_RESPONSE_WELLINGTON_2019],
    );
  });

  it('should limit results by data element codes', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['BCD1'],
      },
      [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
    );
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_2'],
      },
      [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_AUCKLAND_2020, CROP_RESPONSE_WELLINGTON_2019],
    );
  });

  it('should limit results by organisation unit codes', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK'],
        dataElementCodes: ['BCD1', 'BCD325'],
      },
      [BCD_RESPONSE_AUCKLAND],
    );
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
      },
      [CROP_RESPONSE_WELLINGTON_2019],
    );
  });

  it('should limit results by start and end dates', async () => {
    // start date only
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        startDate: '2020-01-01',
      },
      [CROP_RESPONSE_AUCKLAND_2020],
    );

    // end date only
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        endDate: '2019-12-31',
      },
      [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019],
    );

    // start and end dates
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        startDate: '2019-12-01',
        endDate: '2019-12-31',
      },
      [CROP_RESPONSE_WELLINGTON_2019],
    );

    // start and end dates, check inclusivity of start date
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        startDate: '2019-11-21',
        endDate: '2019-12-31',
      },
      [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019],
    );

    // start and end dates, check inclusivity of end date
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        startDate: '2019-12-01',
        endDate: '2020-11-21',
      },
      [CROP_RESPONSE_WELLINGTON_2019, CROP_RESPONSE_AUCKLAND_2020],
    );
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
};
