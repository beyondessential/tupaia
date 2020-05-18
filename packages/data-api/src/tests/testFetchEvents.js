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
    expect(api.fetchEvents(options)).to.eventually.deep.equalInAnyOrder(
      getEventsFromResponses(responses, options.dataElementCodes),
    );

  it('throws an error with invalid parameters', async () => {
    await expect(api.fetchEvents()).to.be.rejectedWith(/provide options/);
    await expect(api.fetchEvents(null)).to.be.rejectedWith(/provide options/);
    await expect(api.fetchEvents({})).to.be.rejectedWith(/Invalid content/);

    // no surveyCode
    await expect(
      api.fetchEvents({
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['BCD1', 'BCD325'],
      }),
    ).to.be.rejectedWith(/Invalid content.*surveyCode/);

    // no organisationUnitCodes
    await expect(
      api.fetchEvents({
        surveyCode: 'BCD',
        dataElementCodes: ['BCD1', 'BCD325'],
      }),
    ).to.be.rejectedWith(/Invalid content.*organisationUnitCodes/);

    // no dataElementCodes
    await expect(
      api.fetchEvents({
        surveyCode: 'BCD',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
      }),
    ).to.be.rejectedWith(/Invalid content.*dataElementCodes/);

    // invalid startDate format
    await expect(
      api.fetchEvents({
        surveyCode: 'BCD',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['BCD1', 'BCD325'],
        startDate: 'January first, 2020',
      }),
    ).to.be.rejectedWith(/Invalid content.*startDate/);
  });

  it('returns results in the correct format', async () => {
    await assertCorrectResponse(
      {
        surveyCode: 'BCD',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['BCD1', 'BCD325'],
      },
      [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
    );
    await assertCorrectResponse(
      {
        surveyCode: 'CROP',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
      },
      [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_AUCKLAND_2020, CROP_RESPONSE_WELLINGTON_2019],
    );
  });

  it('should limit results by data element codes', async () => {
    await assertCorrectResponse(
      {
        surveyCode: 'BCD',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['BCD1'],
      },
      [BCD_RESPONSE_AUCKLAND, BCD_RESPONSE_WELLINGTON],
    );
    await assertCorrectResponse(
      {
        surveyCode: 'CROP',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_2'],
      },
      [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_AUCKLAND_2020, CROP_RESPONSE_WELLINGTON_2019],
    );
  });

  it('should limit results by organisation unit codes', async () => {
    await assertCorrectResponse(
      {
        surveyCode: 'BCD',
        organisationUnitCodes: ['NZ_AK'],
        dataElementCodes: ['BCD1', 'BCD325'],
      },
      [BCD_RESPONSE_AUCKLAND],
    );
    await assertCorrectResponse(
      {
        surveyCode: 'CROP',
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
        surveyCode: 'CROP',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        startDate: '2020-01-01',
      },
      [CROP_RESPONSE_AUCKLAND_2020],
    );

    // end date only
    await assertCorrectResponse(
      {
        surveyCode: 'CROP',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        endDate: '2019-12-31',
      },
      [CROP_RESPONSE_AUCKLAND_2019, CROP_RESPONSE_WELLINGTON_2019],
    );

    // start and end dates
    await assertCorrectResponse(
      {
        surveyCode: 'CROP',
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
        surveyCode: 'CROP',
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
        surveyCode: 'CROP',
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['CROP_1', 'CROP_2'],
        startDate: '2019-12-01',
        endDate: '2020-11-21',
      },
      [CROP_RESPONSE_WELLINGTON_2019, CROP_RESPONSE_AUCKLAND_2020],
    );
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
