/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';
import {
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
  CROP_RESPONSE_WELLINGTON_2019,
} from './TupaiaDataApi.fixtures';

const getEventsFromResponses = (responses, dataElementsToInclude) =>
  responses.map(r => ({
    event: r.id,
    orgUnit: r.entityCode,
    orgUnitName: r.entityCode === 'NZ_AK' ? 'Auckland' : 'Wellington',
    eventDate: r.submission_time.substring(0, r.submission_time.length - 1), // remove trailing 'Z'
    dataValues: Object.entries(r.answers)
      .filter(([code]) => dataElementsToInclude.includes(code))
      .reduce(
        (values, [code, answer]) => ({
          ...values,
          [code]: isNaN(answer) ? answer : parseFloat(answer),
        }),
        {},
      ),
  }));

export const testFetchEvents = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  const assertCorrectResponse = async (options, responses) =>
    expect(api.fetchEvents(options)).resolves.toStrictEqual(
      getEventsFromResponses(responses, options.dataElementCodes),
    );

  it('throws an error with invalid parameters', async () => {
    const testData = [
      [undefined, /provide options/],
      [null, /provide options/],
      [{}, /Invalid content/],
      [
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1', 'BCD325'],
        },
        /Invalid content.*surveyCode/,
      ], // no surveyCode
      [
        {
          surveyCode: 'BCD',
          dataElementCodes: ['BCD1', 'BCD325'],
        },
        /Invalid content.*organisationUnitCodes/,
      ], // no organisationUnitCodes
      [
        {
          surveyCode: 'BCD',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        },
        /Invalid content.*dataElementCodes/,
      ], // no dataElementCodes
      [
        {
          surveyCode: 'BCD',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1', 'BCD325'],
          startDate: 'January first, 2020',
        },
        /Invalid content.*startDate/,
      ], // invalid startDate format
    ];

    for (const [options, expectedRegexp] of testData) {
      await expect(api.fetchEvents(options)).toBeRejectedWith(expectedRegexp);
    }
  });

  it('returns results in the correct format, sorted by event date', async () => {
    const testData = [
      [
        {
          surveyCode: 'BCD',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1', 'BCD325'],
        },
        [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
      ],
      [
        {
          surveyCode: 'CROP',
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

  it('should limit results by data element codes', async () => {
    const testData = [
      [
        {
          surveyCode: 'BCD',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1'],
        },
        [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
      ],
      [
        {
          surveyCode: 'CROP',
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
    const testData = [
      [
        {
          surveyCode: 'BCD',
          organisationUnitCodes: ['NZ_AK'],
          dataElementCodes: ['BCD1', 'BCD325'],
        },
        [BCD_RESPONSE_AUCKLAND],
      ],
      [
        {
          surveyCode: 'CROP',
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
          surveyCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          startDate: '2020-01-01',
        },
        [CROP_RESPONSE_AUCKLAND_2020],
      ],
      // end date only
      [
        {
          surveyCode: 'CROP',
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['CROP_1', 'CROP_2'],
          endDate: '2019-12-31',
        },
        [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019],
      ],
      // start and end dates
      [
        {
          surveyCode: 'CROP',
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
          surveyCode: 'CROP',
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
          surveyCode: 'CROP',
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
        surveyCode: 'CROP',
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
        surveyCode: 'CROP',
        organisationUnitCodes: ['NZ_AK'],
        dataElementCodes: ['CROP_1'],
        startDate: '2019-01-01',
        endDate: '2020-01-01',
      },
      [CROP_RESPONSE_AUCKLAND_2019],
    );
  });
};
