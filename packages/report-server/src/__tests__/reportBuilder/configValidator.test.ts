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
    const { fetch, ...restOfInput } = input;

    return {
      transform: [],
      ...restOfInput,
      fetch: { dataElements: ['DE'], ...fetch },
    };
  };

  describe('fetch', () => {
    const topLevelTestData: ConfigTestData = [
      ['empty', { fetch: undefined, transform: [] }, 'Requires "dataGroups" or "dataElements"'],
      ['empty', { fetch: [], transform: [] }, 'fetch must be a `object` type'],
    ];

    runConfigTestCases(topLevelTestData);

    describe('dataElements', () => {
      const testData: ConfigTestData = [
        [
          'undefined',
          { fetch: { dataElements: undefined }, transform: [] },
          'Requires "dataGroups" or "dataElements"',
        ],
        [
          'empty array',
          { fetch: { dataElements: [] }, transform: [] },
          'dataElements field must have at least 1 items',
        ],
        [
          'array of non strings',
          { fetch: { dataElements: [{ DE1: true }] }, transform: [] },
          /dataElements.* must be a `string` type/,
        ],
        ['array of strings', { fetch: { dataElements: ['DE1', 'DE2'] }, transform: [] }, null],
      ];

      runConfigTestCases(testData);
    });

    describe('dataGroups', () => {
      const testData: ConfigTestData = [
        [
          'undefined',
          { fetch: { dataGroups: undefined }, transform: [] },
          'Requires "dataGroups" or "dataElements"',
        ],
        [
          'empty array',
          { fetch: { dataGroups: [] }, transform: [] },
          'Requires "dataGroups" or "dataElements"',
        ],
        [
          'array of non strings',
          { fetch: { dataGroups: [{ DG1: true }] }, transform: [] },
          /dataGroups.*must be a `string` type/,
        ],
        ['array of strings', { fetch: { dataGroups: ['DG1', 'DG2'] }, transform: [] }, null],
      ];

      runConfigTestCases(testData);
    });

    it('dataElements & dataGroups', () => {
      const config = {
        fetch: { dataElements: ['DE1', 'DE2'], dataGroups: ['DG1', 'DG2'] },
        transform: [],
      };
      const validator = configValidator.validateSync(config);
      expect(() => validator).not.toThrow();
    });

    describe('aggregations', () => {
      const testData: ConfigTestData = [
        [
          'non array',
          fullConfig({ fetch: { aggregations: { type: 'SUM' } } }),
          /aggregations.* must be a `array` type/,
        ],
        [
          'array of non strings or objects',
          fullConfig({ fetch: { aggregations: [[1, 2]] } }),
          /aggregations.* must be a `string \| object` type/,
        ],
        [
          'array of strings',
          fullConfig({ fetch: { aggregations: ['SUM', 'FINAL_EACH_DAY'] } }),
          null,
        ],
        [
          'array of objects',
          fullConfig({ fetch: { aggregations: [{ type: 'SUM' }, { type: 'FINAL_EACH_DAY' }] } }),
          null,
        ],
        [
          'array of strings & objects',
          fullConfig({
            fetch: {
              aggregations: [
                'SUM',
                { type: 'OFFSET_PERIOD', config: { periodType: 'DAY', offset: +1 } },
              ],
            },
          }),
          null,
        ],
      ];

      runConfigTestCases(testData);
    });

    describe('startDate', () => {
      const testData: ConfigTestData = [
        [
          'non string or object',
          fullConfig({ fetch: { startDate: ['2020-01-01'] } }),
          /startDate .*must be a `object \| string` type/,
        ],
        [
          'small string',
          fullConfig({ fetch: { startDate: '202' } }),
          'startDate must be at least 4 characters',
        ],
        [
          'object - `unit` is missing',
          fullConfig({ fetch: { startDate: {} } }),
          'startDate.unit is a required field',
        ],
        [
          'object - `unit` is invalid',
          fullConfig({ fetch: { startDate: { unit: 'hour' } } }),
          'startDate.unit must be one of the following values: day, week, month, quarter, year',
        ],
        [
          'object - `offset` is invalid',
          fullConfig({ fetch: { startDate: { unit: 'month', offset: 'year' } } }),
          'startDate.offset must be a `number` type',
        ],
        [
          'object - `modifier` is invalid',
          fullConfig({ fetch: { startDate: { unit: 'month', modifier: 'month' } } }),
          'startDate.modifier must be one of the following values: start_of, end_of',
        ],
        [
          'object - `modifierUnit` is invalid',
          fullConfig({ fetch: { startDate: { unit: 'month', modifierUnit: 'hour' } } }),
          'startDate.modifierUnit must be one of the following values: day, week, month, quarter, year',
        ],
        ['object - minimum fields', fullConfig({ fetch: { startDate: { unit: 'month' } } }), null],
        [
          'object - all fields',
          fullConfig({
            fetch: {
              startDate: { unit: 'year', offset: -1, modifier: 'start_of', modifierUnit: 'month' },
            },
          }),
          null,
        ],
      ];

      runConfigTestCases(testData);
    });

    describe('endDate', () => {
      // `endDate` uses the same validator as `startDate`, so instead of repeating the tests
      // we do a sanity check of some basic cases
      const testData: ConfigTestData = [
        [
          'object - `unit` is invalid',
          fullConfig({ fetch: { endDate: { unit: 'hour' } } }),
          'endDate.unit must be one of the following values: day, week, month, quarter, year',
        ],
        ['object - minimum fields', fullConfig({ fetch: { endDate: { unit: 'month' } } }), null],
        [
          'object - all fields',
          fullConfig({
            fetch: {
              endDate: { unit: 'year', offset: -1, modifier: 'start_of', modifierUnit: 'month' },
            },
          }),
          null,
        ],
      ];

      runConfigTestCases(testData);
    });

    describe('organisationUnits', () => {
      // optional array of strings
      const testData: ConfigTestData = [
        [
          'non-array',
          fullConfig({ fetch: { organisationUnits: { TO: true } } }),
          'fetch.organisationUnits must be a `array`',
        ],
        [
          'array of non-string',
          fullConfig({ fetch: { organisationUnits: [{ TO: true }] } }),
          'fetch.organisationUnits[0] must be a `string`',
        ],
        ['array of string', fullConfig({ fetch: { organisationUnits: ['TO', 'WS'] } }), null],
      ];

      runConfigTestCases(testData);
    });
  });

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
