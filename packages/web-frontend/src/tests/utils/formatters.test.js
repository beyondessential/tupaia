/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { VALUE_TYPES } from '../../components/View/constants';
import { formatDataValue } from '../../utils/formatters';

const { PERCENTAGE, FRACTION_AND_PERCENTAGE } = VALUE_TYPES;

describe('formatters', () => {
  describe('formatDataValue()', () => {
    describe('percentage', () => {
      it('should round off and use no decimal digits for percentages >= 100%', () => {
        expect(formatDataValue(11, PERCENTAGE)).toEqual('1100%');
        expect(formatDataValue(1.1, PERCENTAGE)).toEqual('110%');
        expect(formatDataValue(1.01, PERCENTAGE)).toEqual('101%');
        expect(formatDataValue(1.009, PERCENTAGE)).toEqual('101%');
        expect(formatDataValue(1.001, PERCENTAGE)).toEqual('100%');
        expect(formatDataValue(1, PERCENTAGE)).toEqual('100%');
      });

      it('should use one decimal digit, rounded off for percentages in [1%, 100%)', () => {
        expect(formatDataValue(0.9995, PERCENTAGE)).toEqual('100%');
        expect(formatDataValue(0.9991, PERCENTAGE)).toEqual('99.9%');
        expect(formatDataValue(0.999, PERCENTAGE)).toEqual('99.9%');
        expect(formatDataValue(0.011, PERCENTAGE)).toEqual('1.1%');
        expect(formatDataValue(0.0106, PERCENTAGE)).toEqual('1.1%');
        expect(formatDataValue(0.0101, PERCENTAGE)).toEqual('1%');
        expect(formatDataValue(0.01, PERCENTAGE)).toEqual('1%');
      });

      it('should use the first two non zero decimal digits, rounded off, for percentages < 1%', () => {
        expect(formatDataValue(0.00995, PERCENTAGE)).toEqual('1%');
        expect(formatDataValue(0.00991, PERCENTAGE)).toEqual('0.99%');
        expect(formatDataValue(0.0099, PERCENTAGE)).toEqual('0.99%');
        expect(formatDataValue(0.000995, PERCENTAGE)).toEqual('0.1%');
        expect(formatDataValue(0.000991, PERCENTAGE)).toEqual('0.099%');
        expect(formatDataValue(0.00099, PERCENTAGE)).toEqual('0.099%');
        expect(formatDataValue(0.0009, PERCENTAGE)).toEqual('0.09%');
      });
    });

    describe('fractionAndPercentage', () => {
      it('should use the provided values to display a percentage calculation', () => {
        expect(
          formatDataValue(0.666666, FRACTION_AND_PERCENTAGE, { numerator: 2, denominator: 3 }),
        ).toEqual('2/3 = 66.7%');
      });
    });
  });
});
