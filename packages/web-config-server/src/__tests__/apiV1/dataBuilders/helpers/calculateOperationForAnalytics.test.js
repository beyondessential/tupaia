/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { arrayToAnalytics } from '@tupaia/data-broker';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

import { calculateOperationForAnalytics } from '/apiV1/dataBuilders/helpers';

const models = {};

const analytics = arrayToAnalytics([
  ['temperature', 'TO', '20220101', 2],
  ['temperature', 'TO', '20220101', 5],
  ['temperature', 'TO', '20220101', 7],
  ['temperature', 'TO', '20220101', 2],

  ['result', 'TO', '20220101', 'Positive'],
  ['result', 'TO', '20220101', 'Positive'],
  ['result', 'TO', '20220101', 'Positive Mixed'],
  ['result', 'TO', '20220101', 'Negative'],

  ['uniqueCode', 'TO', '20220101', 'Yes, more than 100'],
  ['uniqueCodeForName', 'TO', '20220101', 'Octavia'],

  ['height', 'TO', '20220101', 15],
  ['width', 'TO', '20220101', 2],

  ['Flower_found_Daisy', 'TO', '20220101', 1],
  ['Flower_found_Tulip', 'TO', '20220101', 'No'],
  ['Flower_found_Orchid', 'TO', '20220101', 1],
  ['Flower_found_Orchid', 'TO', '20220101', 1],

  ['Best_Superhero1', 'TO', '20220101', 'SuperGirl'],
  ['Best_Superhero2', 'TO', '20220101', 'Black Widow'],
  ['Best_Superhero3', 'TO', '20220101', 'My Sister'],

  ['population', 'Melbourne', '19990101', 10],
  ['population', 'Melbourne', '20050101', 100],
  ['population', 'Sydney', '20100101', 20],
  ['population', 'Sydney', '20050101', 200],
]);

describe('calculateOperationForAnalytics', () => {
  it('throws if the operation is not defined', async () => {
    await expect(
      calculateOperationForAnalytics(models, analytics, { operator: 'NOT_AN_OPERATOR' }),
    ).toBeRejectedWith('Cannot find operator: NOT_AN_OPERATOR');
    await expect(calculateOperationForAnalytics(models, analytics, {})).toBeRejectedWith(
      'Cannot find operator: undefined',
    );
  });

  // TODO RN-676: skipping test cases until the tested functionality is fixed
  describe.skip('CHECK_CONDITION', () => {
    it('throws an error when passed too many analytics', async () => {
      await expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'result',
          condition: { value: 'Positive', operator: 'regex' },
        }),
      ).toBeRejectedWith(
        'Too many results passed to checkConditions (calculateOperationForAnalytics)',
      );
    });

    it('returns no data if no analytics match the dataElement', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'CHECK_CONDITION',
        dataElement: 'NON_EXISTENT',
        condition: { value: 'Positive', operator: 'regex' },
      });
      expect(result).toBe(NO_DATA_AVAILABLE);
    });

    it('returns correctly for valid cases', async () => {
      const result1 = await calculateOperationForAnalytics(models, analytics, {
        operator: 'CHECK_CONDITION',
        dataElement: 'uniqueCode',
        condition: { value: 'Yes', operator: 'regex' },
      });
      expect(result1).toBe('Yes');
      const result2 = await calculateOperationForAnalytics(models, analytics, {
        operator: 'CHECK_CONDITION',
        dataElement: 'uniqueCode',
        condition: { value: 'No', operator: 'regex' },
      });
      expect(result2).toBe('No');
    });
  });

  describe('SUBTRACT', () => {
    const createSubtractionConfig = (codes1, codes2) => ({
      operator: 'SUBTRACT',
      operands: [
        {
          dataValues: codes1,
        },
        {
          dataValues: codes2,
        },
      ],
    });

    it('returns no data if appropriate', async () => {
      const result1 = await calculateOperationForAnalytics(
        models,
        analytics,
        createSubtractionConfig(['uniqueCode'], ['NON_EXISTENT']),
      );
      expect(result1).toBe(NO_DATA_AVAILABLE);
      const result2 = await calculateOperationForAnalytics(
        models,
        analytics,
        createSubtractionConfig(['NON_EXISTENT'], ['NON_EXISTENT_EITHER']),
      );
      expect(result2).toBe(NO_DATA_AVAILABLE);
    });

    it('throws if there are not 2 or more operands in the config', async () => {
      await expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'SUBTRACT',
          operands: [{ dataValues: 'hi' }],
        }),
      ).toBeRejectedWith('Must have 2 or more operands');
    });

    it('subtracts correctly in valid cases (and sum multiple analytics with the same code)', async () => {
      const result = await calculateOperationForAnalytics(
        models,
        analytics,
        createSubtractionConfig(['height', 'width'], ['temperature']),
      );
      expect(result).toBe(1);
    });

    it('handles SUM_LATEST_PER_ORG_UNIT aggregation', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['temperature'],
          },
          {
            dataValues: ['population'],
            aggregationType: 'SUM_LATEST_PER_ORG_UNIT',
          },
        ],
      });
      expect(result).toBe(-104); // (2 + 5 + 7 + 2) - (100 + 20)
    });
  });

  // TODO RN-676: skipping test cases until the tested functionality is fixed
  describe.skip('FORMAT', () => {
    it('throws an error when passed too many analytics', async () => {
      await expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'FORMAT',
          dataElement: 'result',
          format: 'Hello: {value}',
        }),
      ).toBeRejectedWith(
        'Too many results passed to checkConditions (calculateOperationForAnalytics)',
      );
    });

    it('returns no data if no analytics match the dataElement', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'FORMAT',
        dataElement: 'NON_EXISTENT',
        format: 'Hello: {value}',
      });
      expect(result).toBe(NO_DATA_AVAILABLE);
    });

    it('returns correctly for valid case', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'FORMAT',
        dataElement: 'uniqueCodeForName',
        format: 'Hello: {value}',
      });
      expect(result).toBe('Hello: Octavia');
    });

    it('returns correctly for multiple replacements', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'FORMAT',
        dataElement: 'uniqueCodeForName',
        format: 'Hello: {value} and also {value}',
      });
      expect(result).toBe('Hello: Octavia and also Octavia');
    });

    it('returns correctly for no replacements', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'FORMAT',
        dataElement: 'uniqueCodeForName',
        format: 'Hello: My friend',
      });
      expect(result).toBe('Hello: My friend');
    });
  });

  describe('COMBINE_BINARY_AS_STRING', () => {
    it('returns the string "None" if no analytics match the dataElement', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          NON_EXISTENT: 'Should not matter',
        },
      });
      expect(result).toBe('None');
    });

    it('returns the string "None" if there are no data values equal to "Yes"', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          temperature: 'Explicitly not "Yes"',
        },
      });
      expect(result).toBe('None');
    });

    it('returns correctly for valid case', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          Flower_found_Daisy: 'Daisy',
          Flower_found_Tulip: 'Tulip',
        },
      });
      expect(result).toBe('Daisy');
    });

    it('returns correctly for multiple "Yes" values - order not guaranteed', async () => {
      const flowerList = await calculateOperationForAnalytics(models, analytics, {
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          Flower_found_Daisy: 'Daisy',
          Flower_found_Tulip: 'Tulip',
          Flower_found_Orchid: 'Orchid',
        },
      });
      // This does assert that there is a duplicate 'Orchid' entry
      expect(flowerList.split(', ')).toStrictEqual(
        expect.arrayContaining(['Orchid', 'Orchid', 'Daisy']),
      );
    });
  });

  // TODO RN-676: skipping test cases until the tested functionality is fixed
  describe.skip('GROUP', () => {
    it('throws an error when passed too many analytics', async () => {
      await expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'GROUP',
          dataElement: 'result',
          groups: {
            Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
            DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
          },
          defaultValue: 'Not a superhero',
        }),
      ).toBeRejectedWith(
        'Too many results passed to checkConditions (calculateOperationForAnalytics)',
      );
    });

    it('returns no data if no analytics match the dataElement', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'GROUP',
        dataElement: 'NON_EXISTENT',
        groups: {
          Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
          DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
        },
        defaultValue: 'Not a superhero',
      });
      expect(result).toBe(NO_DATA_AVAILABLE);
    });

    it('returns correctly for valid cases', async () => {
      const result1 = await calculateOperationForAnalytics(models, analytics, {
        operator: 'GROUP',
        dataElement: 'Best_Superhero1',
        groups: {
          Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
          DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
        },
        defaultValue: 'Not a superhero',
      });
      expect(result1).toBe('DC');

      const result2 = await calculateOperationForAnalytics(models, analytics, {
        operator: 'GROUP',
        dataElement: 'Best_Superhero2',
        groups: {
          Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
          DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
        },
        defaultValue: 'Not a superhero',
      });
      expect(result2).toBe('Marvel');
    });

    it('returns the default value correctly', async () => {
      const result = await calculateOperationForAnalytics(models, analytics, {
        operator: 'GROUP',
        dataElement: 'Best_Superhero3',
        groups: {
          Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
          DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
        },
        defaultValue: 'Not a superhero',
      });
      expect(result).toBe('Not a superhero');
    });
  });
});
