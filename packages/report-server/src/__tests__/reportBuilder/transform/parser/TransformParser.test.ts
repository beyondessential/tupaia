import { TransformParser } from '../../../../reportBuilder/transform/parser/TransformParser';

describe('TransformParser', () => {
  // Use inline class extending the testable class to make protected methods testable
  const testParser = new (class extends TransformParser {
    public readExpression(input: unknown) {
      return super.readExpression(input);
    }
  })();

  describe('isExpression', () => {
    const testData: [string, unknown, unknown][] = [
      ['undefined', undefined, false],
      ['string literal (truthy)', 'name', false],
      ['string literal (falsy)', '', false],
      ['number (truthy)', 1, false],
      ['number (falsy)', 0, false],
      ['boolean (truthy)', true, false],
      ['boolean (falsy)', false, false],
      ['expression', '=orgUnitCodeToName($orgUnit)', true],
    ];

    it.each(testData)('%s', (_, input, received) => {
      const result = TransformParser.isExpression(input);
      expect(result).toBe(received);
    });
  });

  describe('readExpression()', () => {
    const testData: [string, unknown, unknown][] = [
      ['undefined', undefined, undefined],
      ['string literal (truthy)', 'name', 'name'],
      ['string literal (falsy)', '', ''],
      ['number (truthy)', 1, 1],
      ['number (falsy)', 0, 0],
      ['boolean (truthy)', true, true],
      ['boolean (falsy)', false, false],
      ['expression', '=orgUnitCodeToName($orgUnit)', 'orgUnitCodeToName($orgUnit)'],
    ];

    it.each(testData)('%s', (_, input, received) => {
      const result = testParser.readExpression(input);
      expect(result).toBe(received);
    });
  });
});
