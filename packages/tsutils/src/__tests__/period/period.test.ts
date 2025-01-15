import { PERIOD_TYPES, periodToType } from '../../period';

const { DAY, WEEK, MONTH, QUARTER, YEAR } = PERIOD_TYPES;

describe('period utilities', () => {
  describe('periodToType', () => {
    const testData = [
      ['empty input', undefined, undefined],
      ['invalid input (i)', '20165', undefined],
      ['invalid input (ii)', '2016W5', undefined],
      ['invalid input (iii)', '!VALID', undefined],
      ['invalid input (iv)', '!VALID_WITH_W', undefined],
      ['invalid input (v)', 'W122020', undefined],
      ['invalid input (vi)', '2021Q10', undefined],
      ['year', '2016', YEAR],
      ['quarter', '2016Q1', QUARTER],
      ['month', '201605', MONTH],
      ['week', '2016W05', WEEK],
      ['day', '20160501', DAY],
    ];

    it.each(testData)('%s', (_, period, expected) => {
      expect(periodToType(period)).toBe(expected);
    });
  });
});
