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
});
