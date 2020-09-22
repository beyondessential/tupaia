import { expect } from 'chai';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

import { calculateOperationForAnalytics } from '/apiV1/dataBuilders/helpers';

const analytics = [
  { dataElement: 'temperature', value: 2 },
  { dataElement: 'result', value: 'Positive' },
  { dataElement: 'temperature', value: 5 },
  { dataElement: 'result', value: 'Positive' },
  { dataElement: 'temperature', value: 7 },
  { dataElement: 'result', value: 'Positive Mixed' },
  { dataElement: 'temperature', value: 2 },
  { dataElement: 'result', value: 'Negative' },
  { dataElement: 'uniqueCode', value: 'Yes, more than 100' },
  { dataElement: 'uniqueCodeForName', value: 'Octavia' },
  { dataElement: 'height', value: 15 },
  { dataElement: 'width', value: 2 },
  { dataElement: 'Flower_found_Daisy', value: 'Yes' },
  { dataElement: 'Flower_found_Tulip', value: 'No' },
  { dataElement: 'Flower_found_Orchid', value: 'Yes' },
  { dataElement: 'Flower_found_Orchid', value: 'Yes' },
];

describe('calculateOperationForAnalytics', () => {
  it('should throw if the operation is not defined', () => {
    expect(() =>
      calculateOperationForAnalytics(analytics, { operator: 'NOT_AN_OPERATOR' }),
    ).to.throw('Cannot find operator: NOT_AN_OPERATOR');
    expect(() => calculateOperationForAnalytics(analytics, {})).to.throw(
      'Cannot find operator: undefined',
    );
  });

  describe('CHECK_CONDITION', () => {
    it('should throw an error when passed too many analytics', () => {
      expect(() =>
        calculateOperationForAnalytics(analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'result',
          condition: { value: 'Positive', operator: 'regex' },
        }),
      ).to.throw('Too many results passed to checkConditions (calculateOperationForAnalytics)');
    });

    it('should return no data if no analytics match the dataElement', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'NON_EXISTENT',
          condition: { value: 'Positive', operator: 'regex' },
        }),
      ).to.equal(NO_DATA_AVAILABLE);
    });

    it('should return correctly for valid cases', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'uniqueCode',
          condition: { value: 'Yes', operator: 'regex' },
        }),
      ).to.equal('Yes');
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'uniqueCode',
          condition: { value: 'No', operator: 'regex' },
        }),
      ).to.equal('No');
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

    it('should return no data if appropriate', () => {
      expect(
        calculateOperationForAnalytics(
          analytics,
          createSubtractionConfig(['uniqueCode'], ['NON_EXISTENT']),
        ),
      ).to.equal(NO_DATA_AVAILABLE);
      expect(
        calculateOperationForAnalytics(
          analytics,
          createSubtractionConfig(['NON_EXISTENT'], ['NON_EXISTENT_EITHER']),
        ),
      ).to.equal(NO_DATA_AVAILABLE);
    });

    it('should throw if there are not 2 or more operands in the config', () => {
      expect(() =>
        calculateOperationForAnalytics(analytics, {
          operator: 'SUBTRACT',
          operands: [{ dataValues: 'hi' }],
        }),
      ).to.throw('Must have 2 or more operands');
    });

    it('should subtract correctly in valid cases (and sum multiple analytics with the same code)', () => {
      expect(
        calculateOperationForAnalytics(
          analytics,
          createSubtractionConfig(['height', 'width'], ['temperature']),
        ),
      ).to.equal(1);
    });
  });

  describe('FORMAT', () => {
    it('should throw an error when passed too many analytics', () => {
      expect(() =>
        calculateOperationForAnalytics(analytics, {
          operator: 'FORMAT',
          dataElement: 'result',
          format: 'Hello: {value}',
        }),
      ).to.throw('Too many results passed to checkConditions (calculateOperationForAnalytics)');
    });

    it('should return no data if no analytics match the dataElement', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'FORMAT',
          dataElement: 'NON_EXISTENT',
          format: 'Hello: {value}',
        }),
      ).to.equal(NO_DATA_AVAILABLE);
    });

    it('should return correctly for valid case', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'FORMAT',
          dataElement: 'uniqueCodeForName',
          format: 'Hello: {value}',
        }),
      ).to.equal('Hello: Octavia');
    });

    it('should return correctly for multiple replacements', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'FORMAT',
          dataElement: 'uniqueCodeForName',
          format: 'Hello: {value} and also {value}',
        }),
      ).to.equal('Hello: Octavia and also Octavia');
    });

    it('should return correctly for no replacements', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'FORMAT',
          dataElement: 'uniqueCodeForName',
          format: 'Hello: My friend',
        }),
      ).to.equal('Hello: My friend');
    });
  });

  describe('COMBINE_BINARY_AS_STRING', () => {
    // it('should throw an error when passed too many analytics', () => {
    //   expect(() =>
    //     calculateOperationForAnalytics(analytics, {
    //       operator: 'COMBINE_BINARY_AS_STRING',
    //       dataElement: 'result',
    //       COMBINE_BINARY_AS_STRING: 'Hello: {value}',
    //     }),
    //   ).to.throw('Too many results passed to checkConditions (calculateOperationForAnalytics)');
    // });

    it('should return the string "None" if no analytics match the dataElement', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'COMBINE_BINARY_AS_STRING',
          dataElementToString: {
            NON_EXISTENT: 'Should not matter',
          },
        }),
      ).to.equal('None');
    });

    it('should return the string "None" if there are no data values equal to "Yes"', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'COMBINE_BINARY_AS_STRING',
          dataElementToString: {
            temperature: 'Explicitly not "Yes"',
          },
        }),
      ).to.equal('None');
    });

    it('should return correctly for valid case', () => {
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'COMBINE_BINARY_AS_STRING',
          dataElementToString: {
            Flower_found_Daisy: 'Daisy',
            Flower_found_Tulip: 'Tulip',
          },
        }),
      ).to.equal('Daisy');
    });

    it('should return correctly for multiple "Yes" values - order not guaranteed', () => {
      const flowerList = calculateOperationForAnalytics(analytics, {
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          Flower_found_Daisy: 'Daisy',
          Flower_found_Tulip: 'Tulip',
          Flower_found_Orchid: 'Orchid',
        },
      });
      // This does assert that there is a duplicate 'Orchid' entry
      expect(flowerList.split(', ')).to.have.members(['Orchid', 'Orchid', 'Daisy']);
    });
  });
});
