/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '..';

const policy = {
  DL: ['Public'],
  KI: ['Public', 'Admin'],
  SB: ['Royal Australasian College of Surgeons'],
};

describe('AccessPolicy', () => {
  const accessPolicy = new AccessPolicy(policy);

  describe('allows', () => {
    it.each([
      [
        'should allow access to an entity that has at least one permission group, when no permission group is specified',
        'DL',
        true,
      ],
      ['should not allow access to an entity that has no permission groups', 'VU', false],
    ])('%s', (name, entity, expected) => {
      expect(accessPolicy.allows(entity)).toBe(expected);
    });

    it.each([
      [
        'should allow access to a permission group when a matching entity is specified',
        'DL',
        'Public',
        true,
      ],
      [
        'should not allow access to a permission group that exists for a different entity than the one specified',
        'DL',
        'Admin',
        false,
      ],
      [
        'should allow access to a permission group that includes spaces',
        'SB',
        'Royal Australasian College of Surgeons',
        true,
      ],
    ])('%s', (name, entity, permissionGroup, expected) => {
      expect(accessPolicy.allows(entity, permissionGroup)).toBe(expected);
    });

    it('should not allow access if no entity is specified', () => {
      expect(accessPolicy.allows()).toBe(false);
      expect(accessPolicy.allows(null)).toBe(false);
    });
  });

  describe('allowsSome', () => {
    it.each([
      [
        'should allow access to an entity that has at least one permission group, when no permission group is specified',
        ['DL'],
        true,
      ],
      ['should not allow access to an entity that has no permission groups', ['VU'], false],
      ['should not allow access if no entities or permission group are specified', [], false],
      ['should not allow access if no entities or permission group are specified', null, false],
    ])('%s', (name, entities, expected) => {
      expect(accessPolicy.allowsSome(entities)).toBe(expected);
    });

    it.each([
      [
        'should allow access to a permission group when a matching entity is specified',
        ['DL'],
        'Public',
        true,
      ],
      [
        'should allow access to a permission group when multiple entities are specified',
        ['DL', 'DL_North_West', 'VU'],
        'Public',
        true,
      ],
      [
        'should not allow access to a permission group that exists for a different entity than those specified',
        ['DL', 'DL_North_West', 'VU'],
        'Admin',
        false,
      ],
      [
        'should allow access to a permission group that includes spaces',
        ['SB'],
        'Royal Australasian College of Surgeons',
        true,
      ],
      [
        'should allow access if no entities are specified, along with a permission group',
        undefined,
        'Royal Australasian College of Surgeons',
        true,
      ],
      [
        'should allow access if no entities are specified, along with a permission group',
        null,
        'Royal Australasian College of Surgeons',
        true,
      ],
    ])('%s', (name, entities, permissionGroup, expected) => {
      expect(accessPolicy.allowsSome(entities, permissionGroup)).toBe(expected);
    });

    it('should not allow access if no entities or permission group are specified', () => {
      expect(accessPolicy.allowsSome()).toBe(false);
    });
  });

  describe('AccessPolicy.getPermissionGroups', () => {
    it('should return all permission groups when no entities are specified', () => {
      expect(accessPolicy.getPermissionGroups()).toStrictEqual(
        expect.arrayContaining(['Public', 'Admin', 'Royal Australasian College of Surgeons']),
      );
    });

    describe('should return just the permission groups that relate to the provided entities', () => {
      it.each([
        [['KI'], ['Public', 'Admin']],
        [
          ['DL', 'KI'],
          ['Public', 'Admin'],
        ],
        [
          ['SB', 'KI'],
          ['Public', 'Admin', 'Royal Australasian College of Surgeons'],
        ],
      ])(
        'should return just the permission groups that relate to the provided entities',
        (arr, expected) => {
          expect(accessPolicy.getPermissionGroups(arr)).toStrictEqual(
            expect.arrayContaining(expected),
          );
        },
      );
    });
  });
});
