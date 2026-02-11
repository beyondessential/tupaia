import { VALUE_TYPES, formatDataValueByType } from '../formatDataValueByType';

const {
  BOOLEAN,
  CURRENCY,
  FRACTION_AND_PERCENTAGE,
  FRACTION,
  NUMBER_AND_PERCENTAGE,
  NUMBER,
  ONE_DECIMAL_PLACE,
  PERCENTAGE,
  TEXT,
} = VALUE_TYPES;

describe('formatters', () => {
  describe('formatDataValueByType', () => {
    describe('boolean', () => {
      it('returns false for negative values', () => {
        expect(formatDataValueByType({ value: -Number.EPSILON }, BOOLEAN)).toBe(false);
        expect(formatDataValueByType({ value: -1 }, BOOLEAN)).toBe(false);
        expect(formatDataValueByType({ value: Number.MIN_SAFE_INTEGER }, BOOLEAN)).toBe(false);
      });

      it('returns false for zero', () => {
        expect(formatDataValueByType({ value: -0 }, BOOLEAN)).toBe(false);
        expect(formatDataValueByType({ value: 0 }, BOOLEAN)).toBe(false);
      });

      it('returns true for positive values', () => {
        expect(formatDataValueByType({ value: Number.EPSILON }, BOOLEAN)).toBe(true);
        expect(formatDataValueByType({ value: 1 }, BOOLEAN)).toBe(true);
        expect(formatDataValueByType({ value: Number.MAX_SAFE_INTEGER }, BOOLEAN)).toBe(true);
      });

      it('returns false for non-numeric values', () => {
        expect(formatDataValueByType({ value: NaN }, BOOLEAN)).toBe(false);
        expect(formatDataValueByType({ value: null }, BOOLEAN)).toBe(false);
        expect(formatDataValueByType({ value: undefined }, BOOLEAN)).toBe(false);
      });
    });

    describe('currency', () => {
      it('formats values as currency with abbreviated notation', () => {
        expect(formatDataValueByType({ value: 0 }, CURRENCY)).toEqual('$0.00');
        expect(formatDataValueByType({ value: 123.45 }, CURRENCY)).toEqual('$123.45');
        expect(formatDataValueByType({ value: 1_000 }, CURRENCY)).toEqual('$1.00k');
        expect(formatDataValueByType({ value: 1_500_000 }, CURRENCY)).toEqual('$1.50m');
      });
    });

    describe('percentage', () => {
      it('rounds to nearest percentage point for |x| ∈ [100%, ∞)', () => {
        expect(formatDataValueByType({ value: -1 }, PERCENTAGE)).toEqual('-100%');
        expect(formatDataValueByType({ value: -1.001 }, PERCENTAGE)).toEqual('-100%');
        expect(formatDataValueByType({ value: -1.009 }, PERCENTAGE)).toEqual('-101%');
        expect(formatDataValueByType({ value: -1.01 }, PERCENTAGE)).toEqual('-101%');
        expect(formatDataValueByType({ value: -1.1 }, PERCENTAGE)).toEqual('-110%');
        expect(formatDataValueByType({ value: -11 }, PERCENTAGE)).toEqual('-1100%');

        expect(formatDataValueByType({ value: 11 }, PERCENTAGE)).toEqual('1100%');
        expect(formatDataValueByType({ value: 1.1 }, PERCENTAGE)).toEqual('110%');
        expect(formatDataValueByType({ value: 1.01 }, PERCENTAGE)).toEqual('101%');
        expect(formatDataValueByType({ value: 1.009 }, PERCENTAGE)).toEqual('101%');
        expect(formatDataValueByType({ value: 1.001 }, PERCENTAGE)).toEqual('100%');
        expect(formatDataValueByType({ value: 1 }, PERCENTAGE)).toEqual('100%');
      });

      it('rounds to 1 decimal place for |x| ∈ [1%, 100%)', () => {
        expect(formatDataValueByType({ value: -0.999_5 }, PERCENTAGE)).toEqual(
          '-99.9%', // Reminder: `Math.round` rounds toward positive infinity
        );
        expect(formatDataValueByType({ value: -0.999_1 }, PERCENTAGE)).toEqual('-99.9%');
        expect(formatDataValueByType({ value: -0.999 }, PERCENTAGE)).toEqual('-99.9%');
        expect(formatDataValueByType({ value: -0.011 }, PERCENTAGE)).toEqual('-1.1%');
        expect(formatDataValueByType({ value: -0.010_6 }, PERCENTAGE)).toEqual('-1.1%');
        expect(formatDataValueByType({ value: -0.010_1 }, PERCENTAGE)).toEqual('-1%');
        expect(formatDataValueByType({ value: -0.01 }, PERCENTAGE)).toEqual('-1%');

        expect(formatDataValueByType({ value: 0.01 }, PERCENTAGE)).toEqual('1%');
        expect(formatDataValueByType({ value: 0.010_1 }, PERCENTAGE)).toEqual('1%');
        expect(formatDataValueByType({ value: 0.010_6 }, PERCENTAGE)).toEqual('1.1%');
        expect(formatDataValueByType({ value: 0.011 }, PERCENTAGE)).toEqual('1.1%');
        expect(formatDataValueByType({ value: 0.999 }, PERCENTAGE)).toEqual('99.9%');
        expect(formatDataValueByType({ value: 0.999_1 }, PERCENTAGE)).toEqual('99.9%');
        expect(formatDataValueByType({ value: 0.999_5 }, PERCENTAGE)).toEqual('100%');
      });

      it('rounds to 2 significant figures for |x| ∈ (0%, 1%)', () => {
        expect(formatDataValueByType({ value: -0.009_95 }, PERCENTAGE)).toEqual('-1%');
        expect(formatDataValueByType({ value: -0.009_91 }, PERCENTAGE)).toEqual('-0.99%');
        expect(formatDataValueByType({ value: -0.009_9 }, PERCENTAGE)).toEqual('-0.99%');
        expect(formatDataValueByType({ value: -0.000_995 }, PERCENTAGE)).toEqual(
          '-0.099%', // Reminder: `Math.round` rounds toward positive infinity
        );
        expect(formatDataValueByType({ value: -0.000_991 }, PERCENTAGE)).toEqual('-0.099%');
        expect(formatDataValueByType({ value: -0.000_99 }, PERCENTAGE)).toEqual('-0.099%');
        expect(formatDataValueByType({ value: -0.000_9 }, PERCENTAGE)).toEqual('-0.09%');

        expect(formatDataValueByType({ value: 0.000_9 }, PERCENTAGE)).toEqual('0.09%');
        expect(formatDataValueByType({ value: 0.000_99 }, PERCENTAGE)).toEqual('0.099%');
        expect(formatDataValueByType({ value: 0.000_991 }, PERCENTAGE)).toEqual('0.099%');
        expect(formatDataValueByType({ value: 0.000_995 }, PERCENTAGE)).toEqual('0.1%');
        expect(formatDataValueByType({ value: 0.009_9 }, PERCENTAGE)).toEqual('0.99%');
        expect(formatDataValueByType({ value: 0.009_91 }, PERCENTAGE)).toEqual('0.99%');
        expect(formatDataValueByType({ value: 0.009_95 }, PERCENTAGE)).toEqual('1%');
      });

      it('formats zero as ‘0%’', () => {
        expect(formatDataValueByType({ value: 0 }, PERCENTAGE)).toEqual('0%');
      });
    });

    describe('fraction', () => {
      it('displays value over total', () => {
        expect(formatDataValueByType({ value: 2, metadata: { total: 3 } }, FRACTION)).toEqual(
          '2/3',
        );
        expect(formatDataValueByType({ value: 10, metadata: { total: 100 } }, FRACTION)).toEqual(
          '10/100',
        );
      });

      it('returns ‘No data’ when total is non-numeric', () => {
        expect(formatDataValueByType({ value: 0, metadata: { total: null } }, FRACTION)).toEqual(
          'No data',
        );
        expect(
          formatDataValueByType({ value: 0, metadata: { total: undefined } }, FRACTION),
        ).toEqual('No data');
        expect(formatDataValueByType({ value: 0, metadata: { total: NaN } }, FRACTION)).toEqual(
          'No data',
        );
        expect(formatDataValueByType({ value: 0, metadata: { total: '' } }, FRACTION)).toEqual(
          'No data',
        );
        expect(formatDataValueByType({ value: 0, metadata: { total: 'foo' } }, FRACTION)).toEqual(
          'No data',
        );
      });
    });

    describe('fractionAndPercentage', () => {
      it('uses the provided values to display a percentage calculation', () => {
        expect(
          formatDataValueByType(
            {
              value: 0.666_666_666_666_666_6,
              metadata: { numerator: 2, denominator: 3 },
            },
            FRACTION_AND_PERCENTAGE,
          ),
        ).toEqual('2/3 = 66.7%');
      });
    });

    describe('number', () => {
      it('rounds to nearest integer and formats with comma thousands separator', () => {
        expect(formatDataValueByType({ value: Number.MIN_SAFE_INTEGER }, NUMBER)).toEqual(
          '-9,007,199,254,740,991',
        );
        expect(formatDataValueByType({ value: -1_234_567.89 }, NUMBER)).toEqual('-1,234,568');
        expect(formatDataValueByType({ value: -1_000 }, NUMBER)).toEqual('-1,000');
        expect(formatDataValueByType({ value: -1 }, NUMBER)).toEqual('-1');
        expect(formatDataValueByType({ value: -0.1 }, NUMBER)).toEqual('0');
        expect(formatDataValueByType({ value: -0.5 }, NUMBER)).toEqual(
          '0', // Reminder: `Math.round` rounds toward positive infinity
        );
        expect(formatDataValueByType({ value: -Number.EPSILON }, NUMBER)).toEqual('0');

        expect(formatDataValueByType({ value: Number.EPSILON }, NUMBER)).toEqual('0');
        expect(formatDataValueByType({ value: 0.1 }, NUMBER)).toEqual('0');
        expect(formatDataValueByType({ value: 0.5 }, NUMBER)).toEqual('1');
        expect(formatDataValueByType({ value: 1 }, NUMBER)).toEqual('1');
        expect(formatDataValueByType({ value: 1_000 }, NUMBER)).toEqual('1,000');
        expect(formatDataValueByType({ value: 1_234_567.89 }, NUMBER)).toEqual('1,234,568');
        expect(formatDataValueByType({ value: Number.MAX_SAFE_INTEGER }, NUMBER)).toEqual(
          '9,007,199,254,740,991',
        );
      });

      it('uses `valueFormat` from `presentationOptions` when provided', () => {
        const metadata = /** @type {const} */ ({
          presentationOptions: { valueFormat: '0,0.000' },
        });
        expect(formatDataValueByType({ value: 1_234.5, metadata }, NUMBER)).toEqual('1,234.500');
      });

      it('returns value as-is when value is not a number', () => {
        expect(formatDataValueByType({ value: 'not a number' }, NUMBER)).toEqual('not a number');
      });
    });

    describe('numberAndPercentage', () => {
      it('displays value with percentage in parentheses', () => {
        expect(
          formatDataValueByType(
            {
              value: 50,
              metadata: { numerator: 25, denominator: 50 },
            },
            NUMBER_AND_PERCENTAGE,
          ),
        ).toEqual('50 (50.0%)');
        expect(
          formatDataValueByType(
            {
              value: 3,
              metadata: { numerator: 1, denominator: 3 },
            },
            NUMBER_AND_PERCENTAGE,
          ),
        ).toEqual('3 (33.3%)');
      });

      it('displays 0% without decimal for zero percentage', () => {
        expect(
          formatDataValueByType(
            {
              value: 0,
              metadata: { numerator: 0, denominator: 10 },
            },
            NUMBER_AND_PERCENTAGE,
          ),
        ).toEqual('0 (0%)');
      });

      it('returns value as-is when value is NaN', () => {
        expect(
          formatDataValueByType(
            {
              value: NaN,
              metadata: { numerator: 0, denominator: 0 },
            },
            NUMBER_AND_PERCENTAGE,
          ),
        ).toBeNaN();
      });
    });

    describe('oneDecimalPlace', () => {
      it('should format numbers with at most one decimal place', () => {
        expect(formatDataValueByType({ value: 1_000 }, ONE_DECIMAL_PLACE)).toEqual('1,000');
        expect(formatDataValueByType({ value: 1_234.5 }, ONE_DECIMAL_PLACE)).toEqual('1,234.5');
        expect(formatDataValueByType({ value: 1_234.56 }, ONE_DECIMAL_PLACE)).toEqual('1,234.6');
      });

      it('returns value as-is when value is not a number', () => {
        expect(formatDataValueByType({ value: 'N/A' }, ONE_DECIMAL_PLACE)).toEqual('N/A');
      });
    });

    describe('text', () => {
      it('should convert value to string', () => {
        expect(formatDataValueByType({ value: 'hello world' }, TEXT)).toEqual('hello world');
        expect(formatDataValueByType({ value: 0 }, TEXT)).toEqual('0');
        expect(formatDataValueByType({ value: null }, TEXT)).toEqual('null');
        expect(formatDataValueByType({ value: undefined }, TEXT)).toEqual('undefined');
      });
    });

    describe('unknown value type (default formatter)', () => {
      it('should use default numeral format for unknown value types', () => {
        expect(formatDataValueByType({ value: 1_000 }, 'unknownType')).toEqual('1,000');
        expect(formatDataValueByType({ value: '1000' }, 'unknownType')).toEqual('1,000');
        expect(formatDataValueByType({ value: 1_234.56 }, 'unknownType')).toEqual('1,234.56');
        expect(formatDataValueByType({ value: '1234.56' }, 'unknownType')).toEqual('1,234.56');
      });
    });
  });
});
