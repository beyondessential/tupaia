import { expect } from 'chai';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

import { calculateOperationForAnalytics } from '/apiV1/dataBuilders/helpers';

const models = {};

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
  { dataElement: 'Flower_found_Daisy', value: 1 },
  { dataElement: 'Flower_found_Tulip', value: 'No' },
  { dataElement: 'Flower_found_Orchid', value: 1 },
  { dataElement: 'Flower_found_Orchid', value: 1 },
  { dataElement: 'Best_Superhero1', value: 'SuperGirl' },
  { dataElement: 'Best_Superhero2', value: 'Black Widow' },
  { dataElement: 'Best_Superhero3', value: 'My Sister' },
  { dataElement: 'population', value: 10, period: '19990101', organisationUnit: 'Melbourne' },
  { dataElement: 'population', value: 100, period: '20050101', organisationUnit: 'Melbourne' },
  { dataElement: 'population', value: 20, period: '20100101', organisationUnit: 'Sydney' },
  { dataElement: 'population', value: 200, period: '20050101', organisationUnit: 'Sydney' },
];

describe('calculateOperationForAnalytics', () => {
  it('should throw if the operation is not defined', () => {
    expect(
      calculateOperationForAnalytics(models, analytics, { operator: 'NOT_AN_OPERATOR' }),
    ).to.eventually.throw('Cannot find operator: NOT_AN_OPERATOR');
    expect(calculateOperationForAnalytics(models, analytics, {})).to.eventually.throw(
      'Cannot find operator: undefined',
    );
  });

  describe('CHECK_CONDITION', () => {
    it('should throw an error when passed too many analytics', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'result',
          condition: { value: 'Positive', operator: 'regex' },
        }),
      ).to.eventually.throw(
        'Too many results passed to checkConditions (calculateOperationForAnalytics)',
      );
    });

    it('should return no data if no analytics match the dataElement', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'NON_EXISTENT',
          condition: { value: 'Positive', operator: 'regex' },
        }),
      ).to.eventually.equal(NO_DATA_AVAILABLE);
    });

    it('should return correctly for valid cases', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'uniqueCode',
          condition: { value: 'Yes', operator: 'regex' },
        }),
      ).to.eventually.equal('Yes');
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'uniqueCode',
          condition: { value: 'No', operator: 'regex' },
        }),
      ).to.eventually.equal('No');
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
          models,
          analytics,
          createSubtractionConfig(['uniqueCode'], ['NON_EXISTENT']),
        ),
      ).to.eventually.equal(NO_DATA_AVAILABLE);
      expect(
        calculateOperationForAnalytics(
          models,
          analytics,
          createSubtractionConfig(['NON_EXISTENT'], ['NON_EXISTENT_EITHER']),
        ),
      ).to.eventually.equal(NO_DATA_AVAILABLE);
    });

    it('should throw if there are not 2 or more operands in the config', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'SUBTRACT',
          operands: [{ dataValues: 'hi' }],
        }),
      ).to.eventually.throw('Must have 2 or more operands');
    });

    it('should subtract correctly in valid cases (and sum multiple analytics with the same code)', () => {
      expect(
        calculateOperationForAnalytics(
          models,
          analytics,
          createSubtractionConfig(['height', 'width'], ['temperature']),
        ),
      ).to.eventually.equal(1);
    });

    it('should handle SUM_LATEST_PER_ORG_UNIT aggregation', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
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
        }),
      ).to.eventually.equal(-104); // (2 + 5 + 7 + 2) - (100 + 20)
    });
  });

  describe('FORMAT', () => {
    it('should throw an error when passed too many analytics', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'FORMAT',
          dataElement: 'result',
          format: 'Hello: {value}',
        }),
      ).to.eventually.throw(
        'Too many results passed to checkConditions (calculateOperationForAnalytics)',
      );
    });

    it('should return no data if no analytics match the dataElement', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'FORMAT',
          dataElement: 'NON_EXISTENT',
          format: 'Hello: {value}',
        }),
      ).to.eventually.equal(NO_DATA_AVAILABLE);
    });

    it('should return correctly for valid case', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'FORMAT',
          dataElement: 'uniqueCodeForName',
          format: 'Hello: {value}',
        }),
      ).to.eventually.equal('Hello: Octavia');
    });

    it('should return correctly for multiple replacements', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'FORMAT',
          dataElement: 'uniqueCodeForName',
          format: 'Hello: {value} and also {value}',
        }),
      ).to.eventually.equal('Hello: Octavia and also Octavia');
    });

    it('should return correctly for no replacements', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'FORMAT',
          dataElement: 'uniqueCodeForName',
          format: 'Hello: My friend',
        }),
      ).to.eventually.equal('Hello: My friend');
    });
  });

  describe('COMBINE_BINARY_AS_STRING', () => {
    it('should return the string "None" if no analytics match the dataElement', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'COMBINE_BINARY_AS_STRING',
          dataElementToString: {
            NON_EXISTENT: 'Should not matter',
          },
        }),
      ).to.eventually.equal('None');
    });

    it('should return the string "None" if there are no data values equal to "Yes"', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'COMBINE_BINARY_AS_STRING',
          dataElementToString: {
            temperature: 'Explicitly not "Yes"',
          },
        }),
      ).to.eventually.equal('None');
    });

    it('should return correctly for valid case', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'COMBINE_BINARY_AS_STRING',
          dataElementToString: {
            Flower_found_Daisy: 'Daisy',
            Flower_found_Tulip: 'Tulip',
          },
        }),
      ).to.eventually.equal('Daisy');
    });

    it('should return correctly for multiple "Yes" values - order not guaranteed', async () => {
      const flowerList = await calculateOperationForAnalytics(models, analytics, {
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

  describe('GROUP', () => {
    it('should throw an error when passed too many analytics', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'GROUP',
          dataElement: 'result',
          groups: {
            Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
            DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
          },
          defaultValue: 'Not a superhero',
        }),
      ).to.eventually.throw(
        'Too many results passed to checkConditions (calculateOperationForAnalytics)',
      );
    });

    it('should return no data if no analytics match the dataElement', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'GROUP',
          dataElement: 'NON_EXISTENT',
          groups: {
            Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
            DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
          },
          defaultValue: 'Not a superhero',
        }),
      ).to.eventually.equal(NO_DATA_AVAILABLE);
    });

    it('should return correctly for valid cases', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'GROUP',
          dataElement: 'Best_Superhero1',
          groups: {
            Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
            DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
          },
          defaultValue: 'Not a superhero',
        }),
      ).to.eventually.equal('DC');

      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'GROUP',
          dataElement: 'Best_Superhero2',
          groups: {
            Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
            DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
          },
          defaultValue: 'Not a superhero',
        }),
      ).to.eventually.equal('Marvel');
    });

    it('should return the default value correctly', () => {
      expect(
        calculateOperationForAnalytics(models, analytics, {
          operator: 'GROUP',
          dataElement: 'Best_Superhero3',
          groups: {
            Marvel: { value: '(Black Widow)|(Iron Man)', operator: 'regex' },
            DC: { value: '(SuperGirl)|(Batman)', operator: 'regex' },
          },
          defaultValue: 'Not a superhero',
        }),
      ).to.eventually.equal('Not a superhero');
    });
  });
});
