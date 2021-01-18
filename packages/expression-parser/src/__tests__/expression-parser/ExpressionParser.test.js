/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from '../../expression-parser';

describe('ExpressionParser', () => {
  it('evaluate arithmetic expression', async () => {
    const parser = new ExpressionParser();
    const result = parser.evaluate('1 + 1');
    expect(result).toEqual(2);
  });

  describe('evaluateToNumber()', () => {
    it('converts true to 1', () => {
      const parser = new ExpressionParser();
      const result = parser.evaluateToNumber('2 > 1');
      expect(result).toEqual(1);
    });

    it('converts false to 0', () => {
      const parser = new ExpressionParser();
      const result = parser.evaluateToNumber('2 < 1');
      expect(result).toEqual(0);
    });
  });
});
