/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { upperFirst } from '../string';

describe('string utilities', () => {
  describe('upperFirst', () => {
    it('all lowercase', () => {
      expect(upperFirst('lowercase words')).toBe('Lowercase words');
    });

    it('all uppercase', () => {
      expect(upperFirst('UPPERCASE WORDS')).toBe('UPPERCASE WORDS');
    });

    it('mixed case - lowercase first', () => {
      expect(upperFirst('mIXed WOrdS')).toBe('MIXed WOrdS');
    });
  });
});
