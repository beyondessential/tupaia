/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { UserDefinedDataTableService } from '../../../dataTableService/userDefined/UserDefinedDataTableService';

class TestUserDefinedDataTableService extends UserDefinedDataTableService {
  public constructor(config: unknown) {
    super({}, yup.object(), config);
  }

  protected async pullData(params: Record<string, unknown>) {
    return [params];
  }
}

describe('UserDefinedDataTableService', () => {
  describe('parameters', () => {
    describe('parameter config validation', () => {
      const testData: [string, unknown, string][] = [
        [
          'missing name',
          [{ config: { type: 'string' } }],
          'parameters[0].name is a required field',
        ],
        ['missing config', [{ name: 'param' }], 'parameters[0].config.type is a required field'],
        [
          'missing config type',
          [{ name: 'param', config: { required: true } }],
          'parameters[0].config.type is a required field',
        ],
        [
          'unknown config type',
          [{ name: 'param', config: { type: 'banana' } }],
          'Missing logic to serialize to yup validator for parameter of type: banana',
        ],
      ];

      it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
        expect(() => new TestUserDefinedDataTableService({ parameters })).toThrow(expectedError);
      });
    });

    const parameters = [
      { name: 'stringParam', config: { type: 'string' } },
      { name: 'dateParam', config: { type: 'date' } },
      { name: 'arrayParam', config: { type: 'array', innerType: { type: 'string' } } },
      { name: 'requiredParam', config: { type: 'string', required: true } },
      { name: 'defaultParam', config: { type: 'string', defaultValue: 'default' } },
      { name: 'oneOfParam', config: { type: 'string', oneOf: ['cat', 'dog'] } },
    ];

    describe('user defined parameters in getParameters()', () => {
      it('returns empty parameters if none provided', () => {
        const testService = new TestUserDefinedDataTableService({});
        const result = testService.getParameters();
        expect(result).toEqual([]);
      });

      it('returns parameters that are provided in the config', () => {
        const testService = new TestUserDefinedDataTableService({ parameters });
        const result = testService.getParameters();
        expect(result).toEqual(parameters);
      });
    });

    describe('user defined parameters in fetchData()', () => {
      const validParameterValues = {
        stringParam: 'test',
        dateParam: '2020-01-01T00:00:00.000Z',
        arrayParam: ['test1', 'test2'],
        requiredParam: 'required',
        defaultParam: undefined,
        oneOfParam: 'cat',
      };

      describe('user defined parameter validation', () => {
        const testData: [string, Record<string, unknown>, string][] = [
          ['dateParam not a date', { dateParam: 'cat' }, 'dateParam must be a `date` type'],
          ['arrayParam not an array', { arrayParam: false }, 'arrayParam must be a `array` type'],
          [
            'requiredParam not provided',
            { requiredParam: undefined },
            'requiredParam is a required field',
          ],
          [
            'oneOfParam not one of valid values',
            { oneOfParam: 'fish' },
            'oneOfParam must be one of the following values: cat, dog',
          ],
        ];

        it.each(testData)(
          '%s',
          (_, parameterValues: Record<string, unknown>, expectedError: string) => {
            expect(() =>
              new TestUserDefinedDataTableService({ parameters }).fetchData({
                ...validParameterValues,
                ...parameterValues,
              }),
            ).toThrow(expectedError);
          },
        );
      });

      it('parameters are passed in to fetchData()', async () => {
        const testService = new TestUserDefinedDataTableService({ parameters });
        const [results] = await testService.fetchData(validParameterValues);
        expect(results).toEqual({
          ...validParameterValues,
          dateParam: new Date(validParameterValues.dateParam), // date strings get cast to date objects
          defaultParam: 'default', // default value is substituted when param is undefined
        });
      });
    });
  });
});
