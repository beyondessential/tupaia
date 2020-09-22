/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { upperFirst } from '../string';

describe('string utilities', () => {
  describe('upperFirst', () => {
    it.each([
      ['all lowercase', 'lowercase words', 'Lowercase words'],
      ['all uppercase', 'UPPERCASE WORDS', 'UPPERCASE WORDS'],
      ['mixed case - lowercase first', 'mIXed WOrdS', 'MIXed WOrdS'],
    ])('%s', (name, text, expected) => {
      expect(upperFirst(text)).toBe(expected);
    });
  });
});
