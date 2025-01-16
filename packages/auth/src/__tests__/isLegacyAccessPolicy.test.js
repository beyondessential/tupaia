import { isLegacyAccessPolicy } from '../isLegacyAccessPolicy';

describe('isLegacyAccessPolicy', () => {
  it('return true when policy is legacy access policy', () => {
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
    return expect(isLegacyAccessPolicy(legacyAccessPolicy)).toBe(true);
  });

  it('return false when policy is access policy (non-legacy)', () => {
    const accessPolicy = {
      entityCode1: ['permissionGroup1', 'permissionGroup2'],
      entityCode2: ['permissionGroup1'],
    };
    return expect(isLegacyAccessPolicy(accessPolicy)).toBe(false);
  });

  it('throws error if passed a non-object', () => {
    const nonObjectAccessPolicy = 'nonObject';
    return expect(() => isLegacyAccessPolicy(nonObjectAccessPolicy)).toThrow(
      `Invalid AccessPolicyObject type! Expected object, got: ${nonObjectAccessPolicy}`,
    );
  });
});
