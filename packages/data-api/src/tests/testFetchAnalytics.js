/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';

export const testFetchAnalytics = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  it('throws an error with invalid parameters', () => {});
  it('returns results in the correct format', async () => {
    return expect(
      api.fetchAnalytics({
        organisationUnitCodes: ['NZ_AK'],
        dataElementCodes: ['BCD1', 'BCD325'],
      }),
    ).to.eventually.deep.equal([
      {
        dataElement: 'BCD1',
        organisationUnit: 'NZ_AK',
        value: 'Fully operational',
        period: '20200131',
      },
      { dataElement: 'BCD325', organisationUnit: 'NZ_AK', value: 53, period: '20200131' },
    ]);
  });

  it('respects start and end dates', () => {});
};
