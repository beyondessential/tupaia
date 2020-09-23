/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import MockDate from 'mockdate';
import moment from 'moment';

import {
  comparePeriods,
  convertToPeriod,
  dateStringToPeriod,
  findCoarsestPeriodType,
  getCurrentPeriod,
  getPeriodsInRange,
  isCoarserPeriod,
  isFuturePeriod,
  isValidPeriod,
  momentToPeriod,
  parsePeriodType,
  PERIOD_TYPES,
  periodToDisplayString,
  periodToTimestamp,
  periodToType,
} from '../../period/period';

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

  describe('isValidPeriod', () => {
    const testData = [
      ['empty input', undefined, false],
      ['invalid input - wrong format', '20165', false],
      ['invalid input - number', 2016, false],
      ['invalid input - array ', ['2', '0', '2', '0', '0', '2'], false],
      ['invalid input - object ', { period: '202002' }, false],
      ['invalid input - boolean', true, false],
      ['invalid input - Moment', moment(), false],
      ['year', '2016', true],
      ['quarter', '2016Q2', true],
      ['month', '201605', true],
      ['week', '2016W12', true],
      ['day', '20160502', true],
    ];

    it.each(testData)('%s', (_, period, expected) => {
      expect(isValidPeriod(period)).toBe(expected);
    });
  });

  describe('comparePeriods', () => {
    const testData = [
      [
        'year',
        {
          '>': [
            ['2020', '2019'],
            ['2020', '2020Q3'],
            ['2020', '202011'],
            ['2020', '2020W52'],
            ['2020', '20201230'],
          ],
          '=': [
            ['2020', '2020'],
            ['2020', '2020Q4'],
            ['2020', '202012'],
            ['2020', '20201231'],
          ],
          '<': [
            ['2020', '2021'],
            ['2020', '2021Q1'],
            ['2020', '202101'],
            ['2020', '2021W01'],
            ['2020', '20210101'],
          ],
        },
      ],
      [
        'quarter',
        {
          '>': [
            ['2020Q1', '2019'],
            ['2020Q1', '2019Q4'],
            ['2020Q1', '201912'],
            ['2020Q1', '2019W52'],
            ['2020Q1', '20191231'],
          ],
          '=': [
            ['2020Q4', '2020'],
            ['2020Q4', '2020Q4'],
            ['2020Q4', '202012'],
            ['2020Q4', '20201231'],
          ],
          '<': [
            ['2020Q4', '2021'],
            ['2020Q4', '2021Q1'],
            ['2020Q4', '202101'],
            ['2020Q4', '2021W01'],
            ['2020Q4', '20210101'],
          ],
        },
      ],
      [
        'month',
        {
          '>': [
            ['202001', '2019'],
            ['202001', '2019Q4'],
            ['202001', '201912'],
            ['202001', '2019W52'],
            ['202001', '20191231'],
          ],
          '=': [
            ['202012', '2020'],
            ['202012', '2020Q4'],
            ['202012', '202012'],
            ['202012', '20201231'],
          ],
          '<': [
            ['202012', '2021'],
            ['202012', '2021Q1'],
            ['202012', '202101'],
            ['202012', '2021W01'],
            ['202012', '20210101'],
          ],
        },
      ],
      [
        'week',
        {
          '>': [
            ['2020W01', '2019'],
            ['2020W01', '2019Q4'],
            ['2020W01', '201912'],
            ['2020W01', '2019W52'],
            ['2020W01', '20191231'],
          ],
          '=': [
            ['2020W53', '2020W53'],
            ['2020W52', '20201227'],
            ['2020W53', '20210103'],
          ],
          '<': [
            ['2020W52', '2021'],
            ['2020W52', '2021Q1'],
            ['2020W52', '202101'],
            ['2020W52', '2021W01'],
            ['2020W52', '20201228'],
            ['2020W53', '20210301'],
          ],
        },
      ],
      [
        'day',
        {
          '>': [
            ['20200101', '2019'],
            ['20200101', '2019Q4'],
            ['20200101', '201912'],
            ['20191230', '2019W52'],
            ['20200101', '20191231'],
          ],
          '=': [
            ['20201231', '2020'],
            ['20201231', '202012'],
            ['20201231', '2020Q4'],
            ['20201227', '2020W52'],
            ['20210103', '2020W53'],
          ],
          '<': [
            ['20201231', '2021'],
            ['20201231', '2021Q1'],
            ['20201231', '202101'],
            ['20201231', '2021W01'],
            ['20201231', '20210101'],
          ],
        },
      ],
    ];

    it.each(testData)('%s', (_, testCaseData) => {
      testCaseData['>'].forEach(([periodA, periodB]) => {
        expect(comparePeriods(periodA, periodB)).toBeGreaterThan(0);
      });
      testCaseData['='].forEach(([periodA, periodB]) => {
        expect(comparePeriods(periodA, periodB)).toBe(0);
      });
      testCaseData['<'].forEach(([periodA, periodB]) => {
        expect(comparePeriods(periodA, periodB)).toBeLessThan(0);
      });
    });
  });

  describe('isFuturePeriod', () => {
    const currentDateStub = '2020-12-31';

    beforeEach(() => {
      MockDate.set(currentDateStub);
    });

    afterEach(() => {
      MockDate.reset();
    });

    const testData = [
      ['past', ['2019', '2020Q3', '202011', '2020W52', '20201230'], false],
      ['present', ['2020', '2020Q4', '202012', '20201231'], false],
      ['future', ['2021', '2021Q1', '202101', '2021W01', '2020W53', '20210101'], true],
    ];

    it.each(testData)('%s', (_, testCaseData, expected) => {
      testCaseData.forEach(date => {
        expect(isFuturePeriod(date)).toBe(expected);
      });
    });

    it('present - week period type', () => {
      // We need to match the last day of a week
      MockDate.set('2020-12-27');
      expect(isFuturePeriod('2020W52')).toBe(false);
    });
  });

  describe('parsePeriodType', () => {
    it('should return the period type regardless of case', () => {
      const testData = [
        ['YEAR', YEAR],
        ['quaRter', QUARTER],
        ['mOnTh', MONTH],
        ['wEEk', WEEK],
        ['day', DAY],
      ];

      testData.forEach(([periodType, expected]) => {
        expect(parsePeriodType(periodType)).toBe(expected);
      });
    });

    it('should throw an error for a wrong input', () => {
      const wrongValues = ['random', false, undefined, null, '201701', { MONTH: 'MONTH' }];
      wrongValues.map(wrongValue =>
        expect(() => parsePeriodType(wrongValue)).toThrowError('Period type'),
      );
    });
  });

  describe('momentToPeriod', () => {
    const momentStub = { format: args => args };
    const testData = [
      ['year', YEAR, 'YYYY'],
      ['quarter', QUARTER, 'YYYY[Q]Q'],
      ['month', MONTH, 'YYYYMM'],
      ['week', WEEK, 'GGGG[W]WW'],
      ['day', DAY, 'YYYYMMDD'],
    ];

    it.each(testData)('%s', (_, periodType, expected) => {
      expect(momentToPeriod(momentStub, periodType)).toBe(expected);
    });
  });

  describe('dateStringToPeriod', () => {
    const testData = [
      ['should use `day` by default', '2020-02-15', undefined, '20200215'],
      ['should convert compatible date formats: date', '2020-02-15', undefined, '20200215'],
      [
        'should convert compatible date formats - date & time',
        '2020-02-15 10:18:00',
        undefined,
        '20200215',
      ],
      ['year', '2020-02-15', YEAR, '2020'],
      ['quarter', '2020-02-15', QUARTER, '2020Q1'],
      ['quarter', '2020-04-01', QUARTER, '2020Q2'],
      ['month', '2020-02-15', MONTH, '202002'],
      ['week', '2020-02-15', WEEK, '2020W07'],
      ['day', '2020-02-15', DAY, '20200215'],
    ];

    it.each(testData)('%s', (_, date, periodType, expected) => {
      expect(dateStringToPeriod(date, periodType)).toBe(expected);
    });
  });

  describe('periodToTimestamp', () => {
    const testData = [
      ['year', '2016', 1451606400000],
      ['quarter', '2016Q1', 1451606400000],
      ['month', '201602', 1454284800000],
      ['week', '2016W06', 1454889600000],
      ['day', '20160229', 1456704000000],
    ];

    it.each(testData)('%s', (_, period, expected) => {
      expect(periodToTimestamp(period)).toBe(expected);
    });
  });

  describe('getCurrentPeriod', () => {
    const currentDateStub = '2020-12-27';

    beforeAll(() => {
      MockDate.set(currentDateStub);
    });

    afterAll(() => {
      MockDate.reset();
    });

    const testData = [
      ['year', YEAR, '2020'],
      ['quarter', QUARTER, '2020Q4'],
      ['month', MONTH, '202012'],
      ['week', WEEK, '2020W52'],
      ['day', DAY, '20201227'],
    ];

    it.each(testData)('%s', (_, periodType, expected) => {
      expect(getCurrentPeriod(periodType)).toBe(expected);
    });
  });

  describe('periodToDisplayString', () => {
    const testData = [
      [
        'target type: year',
        [
          ['2019', '2019'],
          ['2019Q3', '2019'],
          ['201912', '2019'],
          ['2019W12', '2019'],
          ['20191202', '2019'],
        ],
        YEAR,
      ],
      [
        'target type: quarter',
        [
          ['2019', 'Q1 2019'],
          ['2019Q3', 'Q3 2019'],
          ['201912', 'Q4 2019'],
          ['2019W49', 'Q4 2019'],
          ['20191202', 'Q4 2019'],
        ],
        QUARTER,
      ],
      [
        'target type: month',
        [
          ['2019', 'Jan 2019'],
          ['2019Q3', 'Jul 2019'],
          ['201912', 'Dec 2019'],
          ['2019W49', 'Dec 2019'],
          ['20191202', 'Dec 2019'],
        ],
        MONTH,
      ],
      [
        'target type: week',
        [
          ['2019', '1st Jan 2019'],
          ['2019Q3', '1st Jul 2019'],
          ['201912', '1st Dec 2019'],
          ['2019W49', '2nd Dec 2019'],
          ['20191202', '2nd Dec 2019'],
        ],
        WEEK,
      ],
      [
        'target type: day',
        [
          ['2019', '1st Jan 2019'],
          ['2019Q3', '1st Jul 2019'],
          ['201912', '1st Dec 2019'],
          ['2019W48', '25th Nov 2019'],
          ['2019W49', '2nd Dec 2019'],
          ['20191202', '2nd Dec 2019'],
        ],
        DAY,
      ],
      [
        'target type: undefined - should default to the period type of the input',
        [
          ['2019', '2019'],
          ['2019Q3', 'Q3 2019'],
          ['201912', 'Dec 2019'],
          ['20191202', '2nd Dec 2019'],
        ],
        undefined,
      ],
    ];

    it.each(testData)('%s', (_, testCaseData, periodType) => {
      testCaseData.forEach(([period, expected]) => {
        expect(periodToDisplayString(period, periodType)).toBe(expected);
      });
    });
  });

  describe.only('convertToPeriod', () => {
    it('should convert to end periods by default', () => {
      expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', MONTH, true));
    });

    it('target type should be case insensitive', () => {
      ['month', 'MONTH', 'mOnTh'].forEach(targetType => {
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
  });

  describe('findCoarsestPeriodType', () => {
    const testData = [
      ['empty input', [], undefined],
      ['some period types in input are invalid', ['RANDOM', 'INPUT'], undefined],
      ['some period types in the input are invalid', [DAY, undefined, MONTH, 'RANDOM', DAY], MONTH],
      ['year', [DAY, YEAR, WEEK, QUARTER, MONTH, DAY, MONTH], YEAR],
      ['quarter', [DAY, DAY, QUARTER, MONTH], QUARTER],
      ['month', [DAY, MONTH, WEEK, DAY], MONTH],
      ['week', [DAY, WEEK, DAY], WEEK],
      ['day', [DAY, DAY], DAY],
      ['should work correctly with a single period', [YEAR], YEAR],
    ];

    it.each(testData)('%s', (_, periodTypes, expected) => {
      expect(findCoarsestPeriodType(periodTypes)).toBe(expected);
    });
  });

  describe('isCoarserPeriod', () => {
    const testData = [
      ['undefined periods (i)', [], false],
      ['undefined periods (ii)', ['2012'], false],
      ['invalid periods (i)', ['NOT_A_PERIOD', '2016W22'], false],
      ['invalid periods (ii)', ['2016Q1', 'NOT_A_PERIOD'], false],
      ['invalid periods (iii)', ['NOT_A_PERIOD', 'NEITHER_IS_THIS'], false],
      ['year', ['2016', '2016Q2'], true],
      ['quarter', ['2016Q2', '2013W02'], true],
      ['month', ['201605', '2016Q2'], false],
      ['week', ['2016W08', '20101010'], true],
      ['day', ['20160502', '2010'], false],
      ['same periods', ['2016', '2016'], false],
    ];

    it.each(testData)('%s', (_, [period1, period2], expected) => {
      expect(isCoarserPeriod(period1, period2)).toBe(expected);
    });
  });

  describe('getPeriodsInRange', () => {
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
  });
});
