import { expect } from 'chai';

import { getPreviousVersion } from '../../utilities/version';

describe('version utilities', () => {
  describe('getPreviousVersion()', () => {
    it('patch > 0, minor > 0', () => {
      expect(getPreviousVersion('1.5.7')).to.equal('1.5.6');
      expect(getPreviousVersion('1.1.1')).to.equal('1.1.0');
      expect(getPreviousVersion('0.1.1')).to.equal('0.1.0');
    });

    it('patch > 0, minor = 0', () => {
      expect(getPreviousVersion('1.5.0')).to.equal('1.4.999');
      expect(getPreviousVersion('1.1.0')).to.equal('1.0.999');
      expect(getPreviousVersion('0.1.0')).to.equal('0.0.999');
    });

    it('patch = 0, minor > 0', () => {
      expect(getPreviousVersion('1.5.1')).to.equal('1.5.0');
      expect(getPreviousVersion('1.0.1')).to.equal('1.0.0');
    });

    it('patch = 0, minor = 0', () => {
      expect(getPreviousVersion('5.0.0')).to.equal('4.999.999');
      expect(getPreviousVersion('1.0.0')).to.equal('0.999.999');
    });

    it('minimum version', () => {
      expect(getPreviousVersion('0.0.1')).to.equal('0.0.1');
    });
  });
});
