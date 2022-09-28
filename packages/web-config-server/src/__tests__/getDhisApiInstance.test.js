/**
 * Tupaia MediTrak
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */
import { getDhisApiInstance } from '../dhis';

describe('getDhisApiInstance()', () => {
  it('should return the same api object for the same api', async () => {
    const options = {
      serverName: 'regional',
    };

    const result1 = await getDhisApiInstance(options);
    const result2 = await getDhisApiInstance(options);

    expect(result1 === result2).toBe(true);
  });
});
