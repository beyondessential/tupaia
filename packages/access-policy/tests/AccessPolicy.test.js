/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '../';

const policy = {
  DL: ['Public'],
  KI: ['Public', 'Admin'],
  SB: ['Royal Australasian College of Surgeons'],
};

describe('AccessPolicy', () => {
  const accessPolicy = new AccessPolicy(policy);

  describe('allows', () => {
    it('should allow access to an entity that has at least one role, when no role is specified', () => {
      expect(accessPolicy.allows('DL')).to.equal(true);
    });

    it('should not allow access to an entity that has no roles', () => {
      expect(accessPolicy.allows('VU')).to.equal(false);
    });

    it('should allow access to a role when a matching entity is specified', () => {
      expect(accessPolicy.allows('DL', 'Public')).to.equal(true);
    });

    it('should not allow access to a role that exists for a different entity than the one specified', () => {
      expect(accessPolicy.allows('DL', 'Admin')).to.equal(false);
    });

    it('should allow access to a role that includes spaces', () => {
      expect(accessPolicy.allows('SB', 'Royal Australasian College of Surgeons')).to.equal(true);
    });

    it('should not allow access if no entity is specified', () => {
      expect(accessPolicy.allows()).to.equal(false);
    });
  });

  describe('allowsSome', () => {
    it('should allow access to an entity that has at least one role, when no role is specified', () => {
      expect(accessPolicy.allowsSome(['DL'])).to.equal(true);
    });

    it('should not allow access to an entity that has no roles', () => {
      expect(accessPolicy.allowsSome(['VU'])).to.equal(false);
    });

    it('should allow access to a role when a matching entity is specified', () => {
      expect(accessPolicy.allowsSome(['DL'], 'Public')).to.equal(true);
    });

    it('should allow access to a role when multiple entities are specified', () => {
      expect(accessPolicy.allowsSome(['DL', 'DL_North_West', 'VU'], 'Public')).to.equal(true);
    });

    it('should not allow access to a role that exists for a different entity than those specified', () => {
      expect(accessPolicy.allowsSome(['DL', 'DL_North_West', 'VU'], 'Admin')).to.equal(false);
    });

    it('should allow access to a role that includes spaces', () => {
      expect(accessPolicy.allowsSome(['SB'], 'Royal Australasian College of Surgeons')).to.equal(
        true,
      );
    });

    it('should not allow access if no entities are specified', () => {
      expect(accessPolicy.allowsSome([])).to.equal(false);
      expect(accessPolicy.allowsSome()).to.equal(false);
    });
  });

  describe('AccessPolicy.getRoles', () => {
    it('should return all roles when no entities are specified', () => {
      expect(accessPolicy.getRoles()).to.deep.equal(
        new Set(['Public', 'Admin', 'Royal Australasian College of Surgeons']),
      );
    });

    it('should return just the roles that relate to the provided entities', () => {
      expect(accessPolicy.getRoles(['KI'])).to.deep.equal(new Set(['Public', 'Admin']));
      expect(accessPolicy.getRoles(['DL', 'KI'])).to.deep.equal(new Set(['Public', 'Admin']));
      expect(accessPolicy.getRoles(['SB', 'KI'])).to.deep.equal(
        new Set(['Public', 'Admin', 'Royal Australasian College of Surgeons']),
      );
    });
  });
});
