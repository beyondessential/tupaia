/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { upperFirst } from '../string';

describe('string utilities', () => {
  describe('upperFirst', () => {
    it('all lowercase', () => {
      expect(upperFirst('lowercase words')).to.equal('Lowercase words');
    });

    it('all uppercase', () => {
      expect(upperFirst('UPPERCASE WORDS')).to.equal('UPPERCASE WORDS');
    });

    it('mixed case - lowercase first', () => {
      expect(upperFirst('mIXed WOrdS')).to.equal('MIXed WOrdS');
    });
  });
});
