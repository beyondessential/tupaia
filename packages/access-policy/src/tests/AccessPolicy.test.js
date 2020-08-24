/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '..';

const policy = {
  DL: ['Public'],
  KI: ['Public', 'Admin'],
  SB: ['Royal Australasian College of Surgeons'],
};

describe('AccessPolicy', () => {
  const accessPolicy = new AccessPolicy(policy);

  describe('allows', () => {
    it('should allow access to an entity that has at least one permission group, when no permission group is specified', () => {
      expect(accessPolicy.allows('DL')).to.equal(true);
    });

    it('should not allow access to an entity that has no permission groups', () => {
      expect(accessPolicy.allows('VU')).to.equal(false);
    });

    it('should allow access to a permission group when a matching entity is specified', () => {
      expect(accessPolicy.allows('DL', 'Public')).to.equal(true);
    });

    it('should not allow access to a permission group that exists for a different entity than the one specified', () => {
      expect(accessPolicy.allows('DL', 'Admin')).to.equal(false);
    });

    it('should allow access to a permission group that includes spaces', () => {
      expect(accessPolicy.allows('SB', 'Royal Australasian College of Surgeons')).to.equal(true);
    });

    it('should not allow access if no entity is specified', () => {
      expect(accessPolicy.allows()).to.equal(false);
      expect(accessPolicy.allows(null)).to.equal(false);
    });
  });

  describe('allowsAll', () => {
    it('should allow access to an entity that has at least one permission group, when no permission group is specified', () => {
      expect(accessPolicy.allowsAll(['DL'])).to.equal(true);
    });

    it('should not allow access to an entity that has no permission groups', () => {
      expect(accessPolicy.allowsAll(['VU'])).to.equal(false);
    });

    it('should allow access to a permission group when a matching entity is specified', () => {
      expect(accessPolicy.allowsAll(['DL'], 'Public')).to.equal(true);
    });

    it('should allow access to a permission group when ALL of the specified entities are matched', () => {
      expect(accessPolicy.allowsAll(['DL', 'KI'], 'Public')).to.equal(true);
    });

    it('should not allow access to a permission group when ANY of the specified entities is not matched', () => {
      expect(accessPolicy.allowsAll(['DL', 'DL_North_West', 'VU'], 'Public')).to.equal(false);
    });

    it('should not allow access to a permission group that exists for a different entity than those specified', () => {
      expect(accessPolicy.allowsAll(['DL', 'DL_North_West', 'VU'], 'Admin')).to.equal(false);
    });

    it('should allow access to a permission group that includes spaces', () => {
      expect(accessPolicy.allowsAll(['SB'], 'Royal Australasian College of Surgeons')).to.equal(
        true,
      );
    });

    it('should not allow access if no entities are specified or the list is empty, along with a permission group', () => {
      expect(accessPolicy.allowsAll(undefined, 'Royal Australasian College of Surgeons')).to.equal(
        false,
      );
      expect(accessPolicy.allowsAll(null, 'Royal Australasian College of Surgeons')).to.equal(
        false,
      );
      expect(accessPolicy.allowsAll([], 'Royal Australasian College of Surgeons')).to.equal(false);
    });

    it('should not allow access if no entities or permission group are specified', () => {
      expect(accessPolicy.allowsAll([])).to.equal(false);
      expect(accessPolicy.allowsAll()).to.equal(false);
      expect(accessPolicy.allowsAll(null)).to.equal(false);
    });
  });

  describe('allowsSome', () => {
    it('should allow access to an entity that has at least one permission group, when no permission group is specified', () => {
      expect(accessPolicy.allowsSome(['DL'])).to.equal(true);
    });

    it('should not allow access to an entity that has no permission groups', () => {
      expect(accessPolicy.allowsSome(['VU'])).to.equal(false);
    });

    it('should allow access to a permission group when a matching entity is specified', () => {
      expect(accessPolicy.allowsSome(['DL'], 'Public')).to.equal(true);
    });

    it('should allow access to a permission group when multiple entities are specified', () => {
      expect(accessPolicy.allowsSome(['DL', 'DL_North_West', 'VU'], 'Public')).to.equal(true);
    });

    it('should not allow access to a permission group that exists for a different entity than those specified', () => {
      expect(accessPolicy.allowsSome(['DL', 'DL_North_West', 'VU'], 'Admin')).to.equal(false);
    });

    it('should allow access to a permission group that includes spaces', () => {
      expect(accessPolicy.allowsSome(['SB'], 'Royal Australasian College of Surgeons')).to.equal(
        true,
      );
    });

    it('should allow access if no entities are specified, along with a permission group', () => {
      expect(accessPolicy.allowsSome(undefined, 'Royal Australasian College of Surgeons')).to.equal(
        true,
      );
      expect(accessPolicy.allowsSome(null, 'Royal Australasian College of Surgeons')).to.equal(
        true,
      );
    });

    it('should not allow access if no entities or permission group are specified', () => {
      expect(accessPolicy.allowsSome([])).to.equal(false);
      expect(accessPolicy.allowsSome()).to.equal(false);
      expect(accessPolicy.allowsSome(null)).to.equal(false);
    });
  });

  describe('AccessPolicy.getPermissionGroups', () => {
    it('should return all permission groups when no entities are specified', () => {
      expect(accessPolicy.getPermissionGroups()).to.have.members([
        'Public',
        'Admin',
        'Royal Australasian College of Surgeons',
      ]);
    });

    it('should return just the permission groups that relate to the provided entities', () => {
      expect(accessPolicy.getPermissionGroups(['KI'])).to.have.members(['Public', 'Admin']);
      expect(accessPolicy.getPermissionGroups(['DL', 'KI'])).to.have.members(['Public', 'Admin']);
      expect(accessPolicy.getPermissionGroups(['SB', 'KI'])).to.have.members([
        'Public',
        'Admin',
        'Royal Australasian College of Surgeons',
      ]);
    });
  });
});
