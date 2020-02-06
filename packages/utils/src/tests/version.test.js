/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { compareMeditrakVersions } from '../version';

describe('version', () => {
  describe('compareMeditrakVersions()', () => {
    it('equal versions', () => {
      expect(compareMeditrakVersions('0.0.1', '0.0.1')).to.equal(0);
      expect(compareMeditrakVersions('0.1.0', '0.1.0')).to.equal(0);
      expect(compareMeditrakVersions('1.0.0', '1.0.0')).to.equal(0);
    });

    it('version A > version B', () => {
      expect(compareMeditrakVersions('0.0.2', '0.0.1')).to.equal(1);
      expect(compareMeditrakVersions('0.1.4', '0.1.3')).to.equal(1);
      expect(compareMeditrakVersions('1.1.6', '1.1.5')).to.equal(1);
      expect(compareMeditrakVersions('1.1.10', '1.1.9')).to.equal(1);
      expect(compareMeditrakVersions('1.6.100', '1.6.99')).to.equal(1);
    });

    it('version B > version A', () => {
      expect(compareMeditrakVersions('0.0.1', '0.0.2')).to.equal(-1);
      expect(compareMeditrakVersions('0.1.3', '0.1.4')).to.equal(-1);
      expect(compareMeditrakVersions('1.1.5', '1.1.6')).to.equal(-1);
      expect(compareMeditrakVersions('1.6.99', '1.6.100')).to.equal(-1);
    });
  });
});
