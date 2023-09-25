/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { mergeAccessPolicies } from '../mergeAccessPolicies';

const accessPolicy1 = {
  TO: ['Public', 'Donor'],
  FJ: ['Admin'],
  PW: ['PSSS', 'Donor'],
};

const accessPolicy2 = {
  TO: ['Admin', 'Donor'],
  PW: ['PSSS', 'Donor'],
  AU: ['COVID-19', 'Admin'],
};

describe('mergeAccessPolicies', () => {
  it('merges access policies', () => {
    return expect(mergeAccessPolicies(accessPolicy1, accessPolicy2)).toEqual({
      TO: ['Public', 'Donor', 'Admin'],
      FJ: ['Admin'],
      PW: ['PSSS', 'Donor'],
      AU: ['COVID-19', 'Admin'],
    });
  });

  it('throws error if passed a non-object for either policy', () => {
    const nonObjectAccessPolicy = 'nonObject';
    expect(() => mergeAccessPolicies(accessPolicy1, nonObjectAccessPolicy)).toThrow(
      `Invalid AccessPolicyObject type! Expected object, got: ${nonObjectAccessPolicy}`,
    );
    expect(() => mergeAccessPolicies(nonObjectAccessPolicy, accessPolicy2)).toThrow(
      `Invalid AccessPolicyObject type! Expected object, got: ${nonObjectAccessPolicy}`,
    );
    expect(() => mergeAccessPolicies(nonObjectAccessPolicy, nonObjectAccessPolicy)).toThrow(
      `Invalid AccessPolicyObject type! Expected object, got: ${nonObjectAccessPolicy}`,
    );
  });
});
