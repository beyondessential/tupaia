import { VALUE_TYPES, formatDataValueByType } from '../formatDataValueByType';

const { PERCENTAGE, FRACTION_AND_PERCENTAGE } = VALUE_TYPES;

describe('formatters', () => {
  describe('formatDataValueByType()', () => {
    describe('percentage', () => {
      it('should round off and use no decimal digits for percentages >= 100%', () => {
        expect(formatDataValueByType({ value: 11 }, PERCENTAGE)).toEqual('1100%');
        expect(formatDataValueByType({ value: 1.1 }, PERCENTAGE)).toEqual('110%');
        expect(formatDataValueByType({ value: 1.01 }, PERCENTAGE)).toEqual('101%');
        expect(formatDataValueByType({ value: 1.009 }, PERCENTAGE)).toEqual('101%');
        expect(formatDataValueByType({ value: 1.001 }, PERCENTAGE)).toEqual('100%');
        expect(formatDataValueByType({ value: 1 }, PERCENTAGE)).toEqual('100%');
      });

      it('should use one decimal digit, rounded off for percentages in [1%, 100%)', () => {
        expect(formatDataValueByType({ value: 0.9995 }, PERCENTAGE)).toEqual('100%');
        expect(formatDataValueByType({ value: 0.9991 }, PERCENTAGE)).toEqual('99.9%');
        expect(formatDataValueByType({ value: 0.999 }, PERCENTAGE)).toEqual('99.9%');
        expect(formatDataValueByType({ value: 0.011 }, PERCENTAGE)).toEqual('1.1%');
        expect(formatDataValueByType({ value: 0.0106 }, PERCENTAGE)).toEqual('1.1%');
        expect(formatDataValueByType({ value: 0.0101 }, PERCENTAGE)).toEqual('1%');
        expect(formatDataValueByType({ value: 0.01 }, PERCENTAGE)).toEqual('1%');
      });

      it('should use the first two non zero decimal digits, rounded off, for percentages < 1%', () => {
        expect(formatDataValueByType({ value: 0.00995 }, PERCENTAGE)).toEqual('1%');
        expect(formatDataValueByType({ value: 0.00991 }, PERCENTAGE)).toEqual('0.99%');
        expect(formatDataValueByType({ value: 0.0099 }, PERCENTAGE)).toEqual('0.99%');
        expect(formatDataValueByType({ value: 0.000995 }, PERCENTAGE)).toEqual('0.1%');
        expect(formatDataValueByType({ value: 0.000991 }, PERCENTAGE)).toEqual('0.099%');
        expect(formatDataValueByType({ value: 0.00099 }, PERCENTAGE)).toEqual('0.099%');
        expect(formatDataValueByType({ value: 0.0009 }, PERCENTAGE)).toEqual('0.09%');
      });
    });

    describe('fractionAndPercentage', () => {
      it('should use the provided values to display a percentage calculation', () => {
        expect(
          formatDataValueByType(
            {
              value: 0.666666,
              metadata: {
                numerator: 2,
                denominator: 3,
              },
            },
            FRACTION_AND_PERCENTAGE,
          ),
        ).toEqual('2/3 = 66.7%');
      });
    });
  });
});
