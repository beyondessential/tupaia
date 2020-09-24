import { convertToPeriod, PERIOD_TYPES } from '../../../period/period';

const { DAY, WEEK, MONTH, YEAR } = PERIOD_TYPES;

export const testConvertToPeriod = () => {
  it('should convert to end periods by default', () => {
    expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', MONTH, true));
  });

  it('target type should be case insensitive', () => {
    ['month', MONTH, 'mOnTh'].forEach(targetType => {
      expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', targetType));
    });
  });

  it('should throw an error if target type is not valid', () => {
    expect(() => convertToPeriod('2016', 'RANDOM')).toThrowError('not a valid period type');
  });

  const testData = [
    [
      'target type: year',
      {
        toStartPeriod: [
          ['2016', '2016'],
          ['201602', '2016'],
          ['2016W10', '2016'],
          ['20160229', '2016'],
          ['2016Q2', '2016'],
        ],
        toEndPeriod: [
          ['2016', '2016'],
          ['201602', '2016'],
          ['2016W10', '2016'],
          ['20160229', '2016'],
          ['2016Q2', '2016'],
        ],
        targetType: YEAR,
      },
    ],
    [
      'target type: month',
      {
        toStartPeriod: [
          ['2016', '201601'],
          ['201602', '201602'],
          ['2016W09', '201602'],
          ['20160229', '201602'],
          ['2016Q2', '201604'],
        ],
        toEndPeriod: [
          ['2016', '201612'],
          ['201602', '201602'],
          ['2016W09', '201603'],
          ['20160229', '201602'],
          ['2016Q2', '201606'],
        ],
        targetType: MONTH,
      },
    ],
    [
      'target type: week',
      {
        toStartPeriod: [
          ['2016', '2015W53'],
          ['201602', '2016W05'],
          ['2016W10', '2016W10'],
          ['20160229', '2016W09'],
          ['2016Q2', '2016W13'],
        ],
        toEndPeriod: [
          ['2016', '2016W52'],
          ['201602', '2016W09'],
          ['2016W10', '2016W10'],
          ['20160229', '2016W09'],
          ['201606', '2016W26'],
          ['2016Q2', '2016W26'],
        ],
        targetType: WEEK,
      },
    ],
    [
      'target type: day',
      {
        toStartPeriod: [
          ['2016', '20160101'],
          ['2016Q2', '20160401'],
          ['201602', '20160201'],
          ['2016W09', '20160229'],
          ['20160229', '20160229'],
        ],
        toEndPeriod: [
          ['2016', '20161231'],
          ['2016Q2', '20160630'],
          ['201602', '20160229'],
          ['2016W09', '20160306'],
          ['20160229', '20160229'],
        ],
        targetType: DAY,
      },
    ],
  ];

  it.each(testData)('%s', (_, testCaseData) => {
    const { toStartPeriod, toEndPeriod, targetType } = testCaseData;

    toStartPeriod.forEach(([period, expected]) => {
      expect(convertToPeriod(period, targetType, false)).toBe(expected);
    });
    toEndPeriod.forEach(([period, expected]) => {
      expect(convertToPeriod(period, targetType, true)).toBe(expected);
    });
  });
};
