/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';
import { BCD_RESPONSE_AUCKLAND } from './TupaiaDataApi.fixtures';

export const testFetchEvents = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  it('throws an error with invalid parameters', () => {});
  it('returns results in the correct format', async () => {
    return expect(
      api.fetchEvents({
        surveyCode: 'BCD',
        organisationUnitCodes: ['NZ_AK'],
        dataElementCodes: ['BCD1', 'BCD325'],
      }),
    ).to.eventually.deep.equalInAnyOrder([
      {
        event: BCD_RESPONSE_AUCKLAND.id,
        orgUnit: 'NZ_AK',
        orgUnitName: 'Auckland',
        eventDate: '2020-01-31T09:00:00',
        dataValues: {
          BCD1: 'Fully operational',
          BCD325: 53,
        },
      },
    ]);
  });

  it('respects start and end dates', () => {});
};
