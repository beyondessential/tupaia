import { BooleanExpressionParser } from '../../expression-parser';

describe('BooleanExpressionParser', () => {
  it('evaluate boolean expression', async () => {
    const parser = new BooleanExpressionParser();
    const result = parser.evaluate('1 < 2');
    expect(result).toEqual(true);
  });
});
