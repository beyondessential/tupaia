/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertPeriodStringToDateRange } from '../../period/convertPeriodStringToDateRange';

describe('convertPeriodStringToDateRange', () => {
  const assertCorrectConversion = (periodString, dateRange) =>
    expect(convertPeriodStringToDateRange(periodString)).toEqual(dateRange);

  it('should convert a period string with a single period', () => {
    assertCorrectConversion('20200126', ['2020-01-26', '2020-01-26']); // day
    assertCorrectConversion('2020W03', ['2020-01-13', '2020-01-19']); // week
    assertCorrectConversion('202001', ['2020-01-01', '2020-01-31']); // month
    assertCorrectConversion('2020Q2', ['2020-04-01', '2020-06-30']); // quarter
    assertCorrectConversion('2020', ['2020-01-01', '2020-12-31']); // year
  });

  it('should convert a period string with more than one period', () => {
    assertCorrectConversion(
      '20180205;20180206;20180207;20180208;20180209;20180210;20180211;20180212', // inside 1 month
      ['2018-02-05', '2018-02-12'],
    );
    assertCorrectConversion(
      '20180528;20180529;20180530;20180531;20180601;20180602', // across months, day types
      ['2018-05-28', '2018-06-02'],
    );
    assertCorrectConversion(
      '202005;202006;202007;202008;202009', // across months, month types
      ['2020-05-01', '2020-09-30'],
    );
  });

  it('should convert a period string with a mix of types', () => {
    assertCorrectConversion('20180227;20180228;201803;201804;201805;201806', [
      '2018-02-27',
      '2018-06-30',
    ]);
    assertCorrectConversion('201911;201912;2020', ['2019-11-01', '2020-12-31']);
  });

  it('should handle February 29 in a leap year', () => {
    assertCorrectConversion('201511;201602', ['2015-11-01', '2016-02-29']);
  });
});
