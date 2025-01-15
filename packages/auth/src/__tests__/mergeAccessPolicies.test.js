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

const legacyAccessPolicy = {
  permissions: {
    surveys: {
      _items: {
        Country: {
          _access: {
            'Permission Group': true,
          },
          _items: {
            Region: {
              _access: {
                'Permission Group': false,
              },
              Region: {
                _access: {
                  'Permission Group': true,
                },
              },
              _items: {
                Facility: {
                  _access: {
                    'Permission Group': false,
                  },
                },
              },
            },
          },
        },
      },
    },
    reports: {
      _items: {
        Country: {
          _access: {
            'Permission Group': true,
          },
          _items: {
            Region: {
              _access: {
                'Permission Group': false,
              },
              Region: {
                _access: {
                  'Permission Group': true,
                },
              },
              _items: {
                Facility: {
                  _access: {
                    'Permission Group': false,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
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

  it('returns first policy when either policy is legacy access policy', () => {
    expect(mergeAccessPolicies(legacyAccessPolicy, accessPolicy1)).toBe(legacyAccessPolicy);
    expect(mergeAccessPolicies(accessPolicy2, legacyAccessPolicy)).toBe(accessPolicy2);
    expect(mergeAccessPolicies(legacyAccessPolicy, legacyAccessPolicy)).toBe(legacyAccessPolicy);
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
