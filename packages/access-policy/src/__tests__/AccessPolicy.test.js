import { AccessPolicy } from '../AccessPolicy';

const policy = {
  DL: ['Public'],
  KI: ['Public', 'Admin'],
  SB: ['Royal Australasian College of Surgeons'],
};

describe('AccessPolicy', () => {
  const accessPolicy = new AccessPolicy(policy);

  describe('allows', () => {
    const testData = [
      [
        'should allow access to an entity that has at least one permission group, when no permission group is specified',
        ['DL', undefined],
        true,
      ],
      [
        'should not allow access to an entity that has no permission groups',
        ['VU', undefined],
        false,
      ],
      [
        'should allow access to a permission group when a matching entity is specified',
        ['DL', 'Public'],
        true,
      ],
      [
        'should not allow access to a permission group that exists for a different entity than the one specified',
        ['DL', 'Admin'],
        false,
      ],
      [
        'should allow access to a permission group that includes spaces',
        ['SB', 'Royal Australasian College of Surgeons'],
        true,
      ],
      ['should not allow access with no entity', [undefined, undefined], false],
      ['should not allow access with null', [null, undefined], false],
    ];

    it.each(testData)('%s', (_, [entity, permissionGroup], expected) => {
      expect(accessPolicy.allows(entity, permissionGroup)).toBe(expected);
    });
  });

  describe('allowsSome', () => {
    describe('no permission group', () => {
      const testData = [
        [
          'should allow access to an entity that has at least one permission group, when no permission group is specified',
          ['DL'],
          true,
        ],
        ['should not allow access to an entity that has no permission groups', ['VU'], false],
        ['should not allow access with no entity', [], false],
        ['should not allow access with null', null, false],
        ['should not allow access with undefined', undefined, false],
      ];

      it.each(testData)('%s', (_, entities, expected) => {
        expect(accessPolicy.allowsSome(entities)).toBe(expected);
      });
    });

    describe('with permission group', () => {
      const testData = [
        [
          'should allow access to a permission group when a matching entity is specified',
          [['DL'], 'Public'],
          true,
        ],
        [
          'should allow access to a permission group when multiple entities are specified',
          [['DL', 'DL_North_West', 'VU'], 'Public'],
          true,
        ],
        [
          'should not allow access to a permission group that exists for a different entity than those specified',
          [['DL', 'DL_North_West', 'VU'], 'Admin'],
          false,
        ],
        [
          'should allow access to a permission group that includes spaces',
          [['SB'], 'Royal Australasian College of Surgeons'],
          true,
        ],
        [
          'should allow access if no entities are specified, along with a permission group',
          [undefined, 'Royal Australasian College of Surgeons'],
          true,
        ],
        [
          'should allow access if no entities are specified, along with a permission group',
          [null, 'Royal Australasian College of Surgeons'],
          true,
        ],
      ];

      it.each(testData)('%s', (_, [entities, permissionGroup], expected) => {
        expect(accessPolicy.allowsSome(entities, permissionGroup)).toBe(expected);
      });
    });
  });

  describe('getPermissionGroups', () => {
    const testData = [
      [
        'should return all permission groups when no entities are specified',
        [[undefined, ['Public', 'Admin', 'Royal Australasian College of Surgeons']]],
      ],
      [
        'should return just the permission groups that relate to the provided entities',
        [
          [['KI'], ['Public', 'Admin']],
          [
            ['DL', 'KI'],
            ['Public', 'Admin'],
          ],
          [
            ['SB', 'KI'],
            ['Public', 'Admin', 'Royal Australasian College of Surgeons'],
          ],
        ],
      ],
    ];

    it.each(testData)('%s', (_, testCaseData) => {
      testCaseData.forEach(([entities, expected]) => {
        expect(accessPolicy.getPermissionGroups(entities)).toStrictEqual(
          expect.arrayContaining(expected),
        );
      });
    });
  });
});
