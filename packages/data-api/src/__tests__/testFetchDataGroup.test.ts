import { getTestDatabase } from '@tupaia/database';

import { TupaiaDataApi } from '../TupaiaDataApi';

describe('fetchDataGroup()', () => {
  const api = new TupaiaDataApi(getTestDatabase());

  it('throws an error with invalid parameters', async () => {
    await expect(api.fetchDataGroup()).toBeRejectedWith(/data group code/);
  });

  it('returns a data group in the correct format', async () => {
    await expect(api.fetchDataGroup('BCDTEST')).resolves.toStrictEqual({
      code: 'BCDTEST',
      name: 'Basic Clinic Data Test',
    });
  });

  it('returns a data group with data elements in the correct format', async () => {
    await expect(
      api.fetchDataGroup('BCDTEST', ['BCD1TEST', 'BCD57TEST'], {
        includeOptions: false,
      }),
    ).resolves.toStrictEqual(
      expect.objectContaining({
        code: 'BCDTEST',
        name: 'Basic Clinic Data Test',
        dataElements: expect.toIncludeSameMembers([
          { code: 'BCD57TEST', name: 'Foundation', text: 'What foundations is it built on?' },
          { code: 'BCD1TEST', name: 'Facility Status', text: 'What the status of the facility?' },
        ]),
      }),
    );
  });

  it('returns a data group with data elements with options metadata included', async () => {
    await expect(
      api.fetchDataGroup('BCDTEST', ['BCD1TEST', 'BCD57TEST', 'BCD902TEST']),
    ).resolves.toStrictEqual(
      expect.objectContaining({
        code: 'BCDTEST',
        name: 'Basic Clinic Data Test',
        dataElements: expect.toIncludeSameMembers([
          {
            code: 'BCD57TEST',
            name: 'Foundation',
            options: {
              'Concrete slab': 'Concrete slab',
              'Concrete stumps': 'Concrete stumps',
              Earth: 'Earth',
              Other: 'Other',
              'Timber on ground': 'Timber on ground',
              'Timber stumps': 'Timber stumps',
            },
            text: 'What foundations is it built on?',
          },
          {
            code: 'BCD1TEST',
            name: 'Facility Status',
            options: undefined,
            text: 'What the status of the facility?',
          },
          {
            code: 'BCD902TEST',
            name: 'Terrain',
            options: {
              Earth: 'Earth',
              Fire: 'Fire',
              Other: 'Other',
              Space: 'Space',
              rock: 'Rocky terrain',
              sea: 'The Ocean',
            },
            text: 'What kind of terrain?',
          },
        ]),
      }),
    );
  });
});
