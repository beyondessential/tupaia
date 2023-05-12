/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable jest/no-conditional-expect */

import { configValidator } from '../../reportBuilder/configValidator';

describe('configValidator', () => {
  type ConfigTestData = [string, Record<string, unknown>, string | RegExp | null][];

  const runConfigTestCases = (testData: ConfigTestData) => {
    it.each(testData)('%s', (_, config, expectedError) => {
      const validator = () => configValidator.validateSync(config);

      if (expectedError) {
        expect(validator).toThrow(expectedError);
      } else {
        expect(validator).not.toThrow();
      }
    });
  };

  /**
   * Fills the config with the minimum required fields,
   * so that the tests can focus on the specific fields under test
   */
  const fullConfig = (input: { [key: string]: unknown; fetch?: Record<string, unknown> }) => {
    const { ...restOfInput } = input;

    return {
      transform: [],
      ...restOfInput,
    };
  };

  describe('transform', () => {
    const testData: ConfigTestData = [
      ['undefined', fullConfig({ transform: undefined }), 'transform is a required field'],
      [
        'non array',
        fullConfig({ transform: { transform: 'updateColumns' } }),
        'transform must be a `array` type',
      ],
      [
        'array',
        fullConfig({
          transform: [
            'keyValueByDataElementName',
            { using: { '*': 'exclude' }, transform: 'mergeRows' },
          ],
        }),
        null,
      ],
    ];

    runConfigTestCases(testData);
  });

  describe('output', () => {
    const testData: ConfigTestData = [
      [
        'non object',
        fullConfig({ output: [{ type: 'matrix' }] }),
        'output must be a `object` type',
      ],
      ['object', fullConfig({ output: { type: 'matrix' } }), null],
    ];

    runConfigTestCases(testData);
  });
});
