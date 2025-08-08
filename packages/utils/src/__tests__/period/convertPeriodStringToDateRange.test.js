import { convertPeriodStringToDateRange } from '../../period/convertPeriodStringToDateRange';

describe('convertPeriodStringToDateRange', () => {
  const testData = [
    ['single period - day', '20200126', ['2020-01-26', '2020-01-26']],
    ['single period - week', '2020W03', ['2020-01-13', '2020-01-19']],
    ['single period - month', '202001', ['2020-01-01', '2020-01-31']],
    ['single period - quarter', '2020Q2', ['2020-04-01', '2020-06-30']],
    ['single period - year', '2020', ['2020-01-01', '2020-12-31']],
    [
      'more than one periods - inside 1 month',
      '20180205;20180206;20180207;20180208;20180209;20180210;20180211;20180212',
      ['2018-02-05', '2018-02-12'],
    ],
    [
      'more than one periods - across months, day types',
      '20180528;20180529;20180530;20180531;20180601;20180602',
      ['2018-05-28', '2018-06-02'],
    ],
    [
      'more than one periods - across months, month types',
      '202005;202006;202007;202008;202009',
      ['2020-05-01', '2020-09-30'],
    ],
    [
      'mix of types (days and months)',
      '20180227;20180228;201803;201804;201805;201806',
      ['2018-02-27', '2018-06-30'],
    ],
    ['mix of types (months and years)', '201911;201912;2020', ['2019-11-01', '2020-12-31']],
    ['should handle February 29 in a leap year', '201511;201602', ['2015-11-01', '2016-02-29']],
  ];

  it.each(testData)('%s', (_, periodString, expected) => {
    expect(convertPeriodStringToDateRange(periodString)).toStrictEqual(expected);
  });
});
