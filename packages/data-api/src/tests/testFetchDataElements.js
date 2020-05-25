/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';

export const testFetchDataElements = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  it('throws an error with invalid parameters', () => {});
  it('returns results in the correct format', async () => {
    return expect(api.fetchDataElements(['BCD1'])).to.eventually.deep.equal([
      {
        code: 'BCD1',
        name: 'Facility Status',
      },
    ]);
  });
};
