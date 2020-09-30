import { getPeriodsInRange, PERIOD_TYPES } from '../../../period/period';

const { DAY, WEEK, MONTH, QUARTER, YEAR } = PERIOD_TYPES;

const MONTHS_IN_YEAR = 12;

const indexToString = index => `${index + 1}`.padStart(2, '0');

const getMonthPeriodsInYear = year =>
  [...new Array(MONTHS_IN_YEAR)].map((_, monthIndex) => `${year}${indexToString(monthIndex)}`);

const getDayPeriodsInMonth = (monthPeriod, dayCountForMonth) =>
  [...new Array(dayCountForMonth)].map((_, dayIndex) => `${monthPeriod}${indexToString(dayIndex)}`);

const createWeekPeriods = (year, startWeekIndex, endWeekIndex) => {
  const weeks = [];
  for (let i = startWeekIndex; i <= endWeekIndex; i++) {
    // indices are 1-based
    weeks.push(`${year}W${indexToString(i - 1)}`);
  }

  return weeks;
};

export const testGetPeriodsInRange = () => {
  describe('validation', () => {
    const testData = [
      [
        'start period is later than the end period',
        ['20160115', '20160114'],
        'must be earlier than or equal',
      ],
      [
        'periods of different types and no target type specified',
        ['2016', '201602'],
        'different period types',
      ],
    ];

    it.each(testData)('%s', (_, [start, end], expectedError) => {
      expect(() => getPeriodsInRange(start, end)).toThrowError(expectedError);
    });
  });

  it('should default to the period type of the inputs if no target type specified', () => {
    const testData = [
      [['2016', '2017'], YEAR],
      [['2016Q1', '2017Q4'], QUARTER],
      [['201601', '201603'], MONTH],
      [['2016W01', '2016W03'], WEEK],
      [['20160301', '20160305'], DAY],
    ];

    testData.forEach(([[start, end], expectedPeriodType]) => {
      expect(getPeriodsInRange(start, end)).toStrictEqual(
        getPeriodsInRange(start, end, expectedPeriodType),
      );
    });
  });

  it('should handle inputs of mixed types when target type is specified', () => {
    const testData = [
      [['201603', '20180403', YEAR], getPeriodsInRange('2016', '2018', YEAR)],
      [['2016', '201804', QUARTER], getPeriodsInRange('2016Q1', '2018Q2', QUARTER)],
      [['2016', '20180403', MONTH], getPeriodsInRange('201601', '201804', MONTH)],
      [['2016', '20180403', WEEK], getPeriodsInRange('2015W53', '2018W14', WEEK)],
      [['2016', '201804', DAY], getPeriodsInRange('20160101', '20180430', DAY)],
    ];

    testData.forEach(([[start, end, targetType], expected]) => {
      expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
    });
  });

  it('should return an array with a single item if period limits are identical', () => {
    expect(getPeriodsInRange('2016', '2016')).toStrictEqual(['2016']);
  });

  describe('should return the periods in range', () => {
    const testData = [
      [
        'target type: year',
        [
          [
            ['2016', '2018'],
            ['2016', '2017', '2018'],
          ],
          [
            ['2016Q1', '2018Q4'],
            ['2016', '2017', '2018'],
          ],
          [
            ['2016Q4', '2018Q1'],
            ['2016', '2017', '2018'],
          ],
          [
            ['201612', '201801'],
            ['2016', '2017', '2018'],
          ],
          [
            ['2016W52', '2018W01'],
            ['2016', '2017', '2018'],
          ],
          [
            ['20161231', '20180101'],
            ['2016', '2017', '2018'],
          ],
        ],
        YEAR,
      ],
      [
        'target type: quarter',
        [
          [
            ['2016', '2017'],
            ['2016Q1', '2016Q2', '2016Q3', '2016Q4', '2017Q1', '2017Q2', '2017Q3', '2017Q4'],
          ],
          [
            ['2016Q1', '2016Q3'],
            ['2016Q1', '2016Q2', '2016Q3'],
          ],
          [
            ['201612', '201701'],
            ['2016Q4', '2017Q1'],
          ],
          [
            ['2016W52', '2017W15'],
            ['2016Q4', '2017Q1', '2017Q2'],
          ],
          [
            ['20161231', '20170401'],
            ['2016Q4', '2017Q1', '2017Q2'],
          ],
        ],
        QUARTER,
      ],
      [
        'target type: month',
        [
          [
            ['2016', '2017'],
            [...getMonthPeriodsInYear('2016'), ...getMonthPeriodsInYear('2017')],
          ],
          [
            ['2016Q3', '2016Q4'],
            ['201607', '201608', '201609', '201610', '201611', '201612'],
          ],
          [
            ['201601', '201603'],
            ['201601', '201602', '201603'],
          ],
          [
            ['2016W01', '2016W09'],
            ['201601', '201602', '201603'],
          ],
          [
            ['20160112', '20160304'],
            ['201601', '201602', '201603'],
          ],
          // crossing year boundary
          [
            ['201612', '201701'],
            ['201612', '201701'],
          ],
          [
            ['201611', '201702'],
            ['201611', '201612', '201701', '201702'],
          ],
          // crossing year boundary with quarters
          [
            ['2016Q4', '2017Q1'],
            ['201610', '201611', '201612', '201701', '201702', '201703'],
          ],
        ],
        MONTH,
      ],
      [
        'target type: week',
        [
          [
            ['2016', '2017'],
            ['2015W53', ...createWeekPeriods('2016', 1, 52), ...createWeekPeriods('2017', 1, 52)],
          ],
          [
            ['201601', '201603'],
            ['2015W53', ...createWeekPeriods('2016', 1, 13)],
          ],
          [['2016W01', '2016W14'], createWeekPeriods('2016', 1, 14)],
          [['20160111', '20160117'], ['2016W02']],
          [
            ['20160110', '20160116'],
            ['2016W01', '2016W02'],
          ],
          // crossing year boundary
          [
            ['20151227', '20160101'],
            ['2015W52', '2015W53'],
          ],
          [
            ['20161231', '20170102'],
            ['2016W52', '2017W01'],
          ],
        ],
        WEEK,
      ],
      [
        'target type: day',
        [
          [
            ['20160101', '20160103'],
            ['20160101', '20160102', '20160103'],
          ],
          [['201601', '201601'], getDayPeriodsInMonth('201601', 31)],
          // crossing year boundary
          [
            ['20161231', '20170101'],
            ['20161231', '20170101'],
          ],
          [
            ['20161230', '20170102'],
            ['20161230', '20161231', '20170101', '20170102'],
          ],
          // crossing month boundary
          [
            ['20160731', '20160801'],
            ['20160731', '20160801'],
          ],
          [
            ['20160730', '20160802'],
            ['20160730', '20160731', '20160801', '20160802'],
          ],
          // February days in a non leap year
          [
            ['20170227', '20170301'],
            ['20170227', '20170228', '20170301'],
          ],
          // February days in a leap year
          [
            ['20160227', '20160301'],
            ['20160227', '20160228', '20160229', '20160301'],
          ],
        ],
        DAY,
      ],
    ];

    it.each(testData)('%s', (_, testCaseData, targetType) => {
      testCaseData.forEach(([[start, end], expected]) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });
    });
  });
};
