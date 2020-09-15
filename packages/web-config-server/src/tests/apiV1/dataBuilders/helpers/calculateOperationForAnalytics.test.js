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
  { dataElement: 'height', value: 15 },
  { dataElement: 'width', value: 2 },
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
      ).to.equal(true);
      expect(
        calculateOperationForAnalytics(analytics, {
          operator: 'CHECK_CONDITION',
          dataElement: 'uniqueCode',
          condition: { value: 'No', operator: 'regex' },
        }),
      ).to.equal(false);
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
});
