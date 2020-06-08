/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';

export const testFetchDataElements = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  it('throws an error with invalid parameters', async () => {
    await expect(api.fetchDataElements()).to.be.rejectedWith(/data element codes/);
    await expect(api.fetchDataElements(null)).to.be.rejectedWith(/data element codes/);
  });

  it('returns a single data element in the correct format', async () => {
    await expect(api.fetchDataElements(['BCD1'])).to.eventually.deep.equal([
      {
        code: 'BCD1',
        name: 'Facility Status',
      },
    ]);
  });

  it('returns multiple data elements in the correct format', async () => {
    await expect(
      api.fetchDataElements(['BCD1', 'CROP_1', 'CROP_2']),
    ).to.eventually.deep.equalInAnyOrder([
      {
        code: 'BCD1',
        name: 'Facility Status',
      },
      {
        code: 'CROP_1',
        name: 'Number of potatoes grown',
      },
      {
        code: 'CROP_2',
        name: 'Number of lettuces grown',
      },
    ]);
  });
};
