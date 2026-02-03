import { createJestMockInstance } from '@tupaia/utils';
import { AnalyticArithmeticBuilder } from '../../../Builder/AnalyticArithmeticBuilder/AnalyticArithmeticBuilder';
import { DbRecord } from '../../../types';

export const testConfigValidation = () => {
  const mockApi = createJestMockInstance('@tupaia/indicators', 'IndicatorApi');

  describe('invalid config', () => {
    const testData: [string, DbRecord, RegExp | string][] = [
      [
        'undefined formula',
        { aggregation: {} },
        /Error .*formula.* Expected nonempty value but got undefined/,
      ],
      ['formula is not a string', { formula: {}, aggregation: {} }, /Error .*formula.* string/],
      [
        'undefined aggregation',
        { formula: 'A + B' },
        'must be one of (AggregationDescriptor | AggregationDescriptor[] | Object<string, AggregationDescriptor>)',
      ],
      [
        'null aggregation',
        { formula: 'A + B', aggregation: null },
        'must be one of (AggregationDescriptor | AggregationDescriptor[] | Object<string, AggregationDescriptor>)',
      ],
      [
        'wrong aggregation type',
        { formula: 'A + B', aggregation: true },
        'must be one of (AggregationDescriptor | AggregationDescriptor[] | Object<string, AggregationDescriptor>)',
      ],
      ['empty aggregation string', { formula: 'A + B', aggregation: '' }, 'must not be empty'],
      [
        'aggregation object without type',
        { formula: 'A + B', aggregation: { config: { periodType: 'month' } } },
        'no aggregation defined',
      ],
      [
        'aggregation object with wrong type',
        { formula: 'A + B', aggregation: { type: true } },
        'non empty string',
      ],
      [
        'aggregation object with empty type',
        { formula: 'A + B', aggregation: { type: '' } },
        'non empty string',
      ],
      [
        'aggregation array item type is invalid',
        { formula: 'A + B', aggregation: ['SUM', true] },
        new RegExp(
          /item #2.* must be one of \(AggregationDescriptor | AggregationDescriptor\[\]\)/,
        ),
      ],
      [
        'aggregation array item is null',
        { formula: 'A + B', aggregation: ['SUM', null] },
        new RegExp(
          /item #2.* must be one of \(AggregationDescriptor | AggregationDescriptor\[\]\)/,
        ),
      ],
      [
        'aggregation array item value is invalid',
        { formula: 'A + B', aggregation: ['SUM', ''] },
        /item #2.* must not be empty/,
      ],
      [
        'aggregation dictionary value is invalid',
        { formula: 'A + B', aggregation: { A: 'SUM', B: '' } },
        /key 'B'.* must not be empty/,
      ],
      [
        'a data element referenced in the formula has no defined aggregation',
        { formula: 'A + B', aggregation: { A: 'MOST_RECENT' } },
        /B.* has no aggregation defined/,
      ],
      [
        'default values is not a plain object',
        {
          formula: 'A + B',
          aggregation: { A: 'MOST_RECENT', B: 'SUM' },
          defaultValues: [{ C: 10 }],
        },
        /defaultValues.* not a plain javascript object/i,
      ],
      [
        'a data element not referenced in the formula has a default',
        {
          formula: 'A + B',
          aggregation: { A: 'MOST_RECENT', B: 'SUM' },
          defaultValues: { C: 10 },
        },
        /C.* is in defaultValues but not referenced in the formula/,
      ],
      [
        'a default value must be a number or "undefined"',
        { formula: 'A + 1', aggregation: { A: 'SUM' }, defaultValues: { A: '10' } },
        /Value 'A' in defaultValues is not in allowed types \(number\) or 'undefined': 10/,
      ],
      [
        'parameters must be an array of objects',
        {
          formula: 'A + 1',
          aggregation: { A: 'SUM' },
          parameters: { code: 'A', builder: 'arithmetic', config: {} },
        },
        /parameters.* should contain an array/i,
      ],
      [
        'all parameters should have an indicator shape',
        {
          formula: 'A + 1',
          aggregation: { A: 'SUM' },
          parameters: [
            { code: 'A', builder: 'arithmetic', config: {} },
            { code: 'A', config: {} },
          ],
        },
        /parameters.* .*builder.* .*Expected nonempty value but got .*/i,
      ],
    ];

    it.each(testData)('%s', (_, config, expectedError) => {
      const indicator = { code: 'test', builder: 'arithmetic', config };
      const builder = new AnalyticArithmeticBuilder(mockApi, indicator);
      return expect(() => builder.validateConfig()).toThrow(expectedError);
    });
  });

  describe('valid config', () => {
    const codesToParameters = (codes: string[]) =>
      codes.map(code => ({ code, builder: 'testAnalytic', config: {} }));

    const testData: [string, DbRecord][] = [
      [
        'single aggregation - string',
        {
          formula: '2 * A + B',
          aggregation: 'MOST_RECENT',
        },
      ],
      [
        'single aggregation - object without config',
        {
          formula: '2 * A + B',
          aggregation: { type: 'FINAL_EACH_WEEK' },
        },
      ],
      [
        'single aggregation - object with config',
        {
          formula: '2 * A + B',
          aggregation: { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
        },
      ],
      [
        'single aggregation - array',
        {
          formula: '2 * A + B',
          aggregation: [
            { type: 'FINAL_EACH_WEEK' },
            'SUM',
            { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
          ],
        },
      ],
      [
        'multiple aggregations - multiple types',
        {
          formula: '2 * A + B + C + D',
          aggregation: {
            A: 'MOST_RECENT',
            B: { type: 'MOST_RECENT' },
            C: { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            D: [
              { type: 'FINAL_EACH_WEEK' },
              'SUM',
              { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            ],
          },
        },
      ],
      [
        'formula includes parameter',
        {
          formula: '2 * A + B',
          aggregation: 'MOST_RECENT',
          parameters: codesToParameters(['B']),
        },
      ],
      [
        'formula consists of parameters',
        {
          formula: '2 * A + B',
          aggregation: 'MOST_RECENT',
          parameters: codesToParameters(['A', 'B']),
        },
      ],
    ];

    it.each(testData)('%s', (_, config) => {
      const indicator = { code: 'test', builder: 'arithmetic', config };
      const builder = new AnalyticArithmeticBuilder(mockApi, indicator);
      return expect(() => builder.validateConfig()).not.toThrow();
    });
  });
};
