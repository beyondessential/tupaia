/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';

export const testFetchDataElements = () => {
  const api = new TupaiaDataApi(getTestDatabase());

  it('throws an error with invalid parameters', async () => {
    await expect(api.fetchDataElements()).toBeRejectedWith(/data element codes/);
    await expect(api.fetchDataElements(null)).toBeRejectedWith(/data element codes/);
  });

  it('returns a single data element in the correct format', async () => {
    await expect(
      api.fetchDataElements(['BCD1TEST'], { includeOptions: false }),
    ).resolves.toStrictEqual([
      {
        code: 'BCD1TEST',
        name: 'Facility Status',
      },
    ]);
  });

  it('returns a single data element with options metadata included', async () => {
    await expect(
      api.fetchDataElements(['BCD57TEST'], { includeOptions: true }),
    ).resolves.toStrictEqual([
      {
        code: 'BCD57TEST',
        name: 'Foundation',
        options: {
          'Concrete slab': 'Concrete slab',
          'Concrete stumps': 'Concrete stumps',
          'Timber stumps': 'Timber stumps',
          'Timber on ground': 'Timber on ground',
          Earth: 'Earth',
          Other: 'Other',
        },
      },
    ]);
  });

  it('returns multiple data elements in the correct format', async () => {
    await expect(
      api.fetchDataElements(['BCD1TEST', 'BCD57TEST', 'CROP_1', 'CROP_2'], {
        includeOptions: false,
      }),
      {
        includeOptions: false,
      },
    ).resolves.toIncludeSameMembers([
      {
        code: 'BCD1TEST',
        name: 'Facility Status',
      },
      {
        code: 'BCD57TEST',
        name: 'Foundation',
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

  it('returns multiple data elements with options metadata included', async () => {
    await expect(api.fetchDataElements(['BCD1TEST', 'BCD57TEST', 'CROP_1', 'CROP_2']), {
      includeOptions: false,
    }).resolves.toIncludeSameMembers([
      {
        code: 'BCD1TEST',
        name: 'Facility Status',
        options: undefined,
      },
      {
        code: 'BCD57TEST',
        name: 'Foundation',
        options: {
          'Concrete slab': 'Concrete slab',
          'Concrete stumps': 'Concrete stumps',
          'Timber stumps': 'Timber stumps',
          'Timber on ground': 'Timber on ground',
          Earth: 'Earth',
          Other: 'Other',
        },
      },
      {
        code: 'CROP_1',
        name: 'Number of potatoes grown',
        options: undefined,
      },
      {
        code: 'CROP_2',
        name: 'Number of lettuces grown',
        options: undefined,
      },
    ]);
  });
};
