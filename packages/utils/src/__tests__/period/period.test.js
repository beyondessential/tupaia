/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
    it('should return undefined for empty input', () => {
      expect(periodToType()).toBeUndefined();
    });

    it.each([['20165'], ['2016W5'], ['!VALID'], ['!VALID_WITH_W'], ['W122020'], ['2021Q10']])(
      'should return undefined for invalid input',
      period => {
        expect(periodToType(period)).toBeUndefined();
      },
    );

    it.each([
      ['year', '2016', YEAR],
      ['quarter', '2016Q1', QUARTER],
      ['month', '201605', MONTH],
      ['week', '2016W05', WEEK],
      ['day', '20160501', DAY],
    ])('%s', (name, period, expected) => {
      expect(periodToType(period)).toBe(expected);
    });
  });

  describe('isValidPeriod', () => {
    it('should return false for empty input', () => {
      expect(isValidPeriod()).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(isValidPeriod('20165')).toBe(false);
    });

    it.each([
      [2016, false],
      [['2', '0', '2', '0', '0', '2'], false],
      [{ period: '202002' }, false],
      [true, false],
      [moment(), false],
    ])('should return false for non-strings', (period, expected) => {
      expect(isValidPeriod(period)).toBe(expected);
    });

    it.each([
      ['2016', true],
      ['201605', true],
      ['2016W12', true],
      ['2016Q2', true],
      ['20160502', true],
    ])('should return true for valid periods', (period, expected) => {
      expect(isValidPeriod(period)).toBe(expected);
    });
  });

  describe('comparePeriods', () => {
    describe('year', () => {
      it.each([
        ['2020', '2019', 0],
        ['2020', '2020Q3', 0],
        ['2020', '202011', 0],
        ['2020', '2020W52', 0],
        ['2020', '20201230', 0],
      ])('>', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeGreaterThan(expected);
      });

      it.each([
        ['2020', '2020', 0],
        ['2020', '2020Q4', 0],
        ['2020', '202012', 0],
        ['2020', '20201231', 0],
      ])('=', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBe(expected);
      });

      it.each([
        ['2020', '2021', 0],
        ['2020', '2021Q1', 0],
        ['2020', '202101', 0],
        ['2020', '2021W01', 0],
        ['2020', '20210101', 0],
      ])('<', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeLessThan(expected);
      });
    });

    describe('quarter', () => {
      it.each([
        ['2020Q1', '2019', 0],
        ['2020Q1', '2019Q4', 0],
        ['2020Q1', '201912', 0],
        ['2020Q1', '2019W52', 0],
        ['2020Q1', '20191231', 0],
      ])('>', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeGreaterThan(expected);
      });

      it.each([
        ['2020Q4', '2020', 0],
        ['2020Q4', '2020Q4', 0],
        ['2020Q4', '202012', 0],
        ['2020Q4', '20201231', 0],
      ])('=', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBe(expected);
      });

      it.each([
        ['2020Q4', '2021', 0],
        ['2020Q4', '2021Q1', 0],
        ['2020Q4', '202101', 0],
        ['2020Q4', '2021W01', 0],
        ['2020Q4', '20210101', 0],
      ])('<', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeLessThan(expected);
      });
    });

    describe('month', () => {
      it.each([
        ['202001', '2019', 0],
        ['202001', '2019Q4', 0],
        ['202001', '201912', 0],
        ['202001', '2019W52', 0],
        ['202001', '20191231', 0],
      ])('>', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeGreaterThan(expected);
      });

      it.each([
        ['202012', '2020', 0],
        ['202012', '2020Q4', 0],
        ['202012', '202012', 0],
        ['202012', '20201231', 0],
      ])('=', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBe(expected);
      });

      it.each([
        ['202012', '2021', 0],
        ['202012', '2021Q1', 0],
        ['202012', '202101', 0],
        ['202012', '2021W01', 0],
        ['202012', '20210101', 0],
      ])('<', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeLessThan(expected);
      });
    });

    describe('week', () => {
      it.each([
        ['2020W01', '2019', 0],
        ['2020W01', '2019Q4', 0],
        ['2020W01', '201912', 0],
        ['2020W01', '2019W52', 0],
        ['2020W01', '20191231', 0],
      ])('>', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeGreaterThan(expected);
      });
      it.each([
        ['2020W53', '2020W53', 0],
        ['2020W52', '20201227', 0],
        ['2020W53', '20210103', 0],
      ])('=', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBe(expected);
      });

      it.each([
        ['2020W52', '2021', 0],
        ['2020W52', '2021Q1', 0],
        ['2020W52', '202101', 0],
        ['2020W52', '2021W01', 0],
        ['2020W52', '20201228', 0],
        ['2020W53', '20210301', 0],
      ])('<', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeLessThan(expected);
      });
    });

    describe('day', () => {
      it.each([
        ['20200101', '2019', 0],
        ['20200101', '2019Q4', 0],
        ['20200101', '201912', 0],
        ['20191230', '2019W52', 0],
        ['20200101', '20191231', 0],
      ])('>', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeGreaterThan(expected);
      });

      it.each([
        ['20201231', '2020', 0],
        ['20201231', '202012', 0],
        ['20201231', '2020Q4', 0],
        ['20201227', '2020W52', 0],
        ['20210103', '2020W53', 0],
      ])('=', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBe(expected);
      });

      it.each([
        ['20201231', '2021', 0],
        ['20201231', '2021Q1', 0],
        ['20201231', '202101', 0],
        ['20201231', '2021W01', 0],
        ['20201231', '20210101', 0],
      ])('<', (periodA, periodB, expected) => {
        expect(comparePeriods(periodA, periodB)).toBeLessThan(expected);
      });
    });
  });

  // TODO: Having trouble converting to jest
  // TypeError: Cannot read property 'useFakeTimers' of undefined
  describe.skip('isFuturePeriod', () => {
    const currentDateStub = '2020-12-31T00:00:00Z';

    beforeEach(() => {
      jest.useFakeTimers('modern').setSystemTime(new Date(currentDateStub).getTime());
    });

    it('past', () => {
      expect(isFuturePeriod('2019')).toBe(false);
      expect(isFuturePeriod('2020Q3')).toBe(false);
      expect(isFuturePeriod('202011')).toBe(false);
      expect(isFuturePeriod('2020W52')).toBe(false);
      expect(isFuturePeriod('20201230')).toBe(false);
    });

    it('present', () => {
      expect(isFuturePeriod('2020')).toBe(false);
      expect(isFuturePeriod('2020Q4')).toBe(false);
      expect(isFuturePeriod('202012')).toBe(false);
      expect(isFuturePeriod('20201231')).toBe(false);
    });

    it('present - week period type', () => {
      // We need to match the last date of a week
      jest.setSystemTime(new Date('2020-12-27T00:00:00Z').getTime());
      expect(isFuturePeriod('2020W52')).toBe(false);
    });

    it('future', () => {
      expect(isFuturePeriod('2021')).toBe(true);
      expect(isFuturePeriod('2021Q1')).toBe(true);
      expect(isFuturePeriod('202101')).toBe(true);
      expect(isFuturePeriod('2021W01')).toBe(true);
      expect(isFuturePeriod('2020W53')).toBe(true);
      expect(isFuturePeriod('20210101')).toBe(true);
    });

    afterEach(() => {
      jest.useRealTimers();
    });
  });

  describe('parsePeriodType', () => {
    it.each([
      ['YEAR', YEAR],
      ['quaRter', QUARTER],
      ['mOnTh', MONTH],
      ['wEEk', WEEK],
      ['day', DAY],
    ])('should return the period type regardless of case', (periodType, expected) => {
      expect(parsePeriodType(periodType)).toBe(expected);
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
    it.each([
      ['year', YEAR, 'YYYY'],
      ['quarter', QUARTER, 'YYYY[Q]Q'],
      ['month', MONTH, 'YYYYMM'],
      ['week', WEEK, 'GGGG[W]WW'],
      ['day', DAY, 'YYYYMMDD'],
    ])('%s', (name, periodType, expected) => {
      expect(momentToPeriod(momentStub, periodType)).toBe(expected);
    });
  });

  describe('dateStringToPeriod', () => {
    it('should use `day` by default', () => {
      expect(dateStringToPeriod('2020-02-15')).toBe(dateStringToPeriod('2020-02-15', DAY));
    });

    it.each([
      ['2020-02-15', '20200215'],
      ['2020-02-15 10:18:00', '20200215'],
    ])('should convert compatible date formats', (date, expected) => {
      expect(dateStringToPeriod(date)).toBe(expected);
    });

    it.each([
      ['year', '2020-02-15', YEAR, '2020'],
      ['quarter', '2020-02-15', QUARTER, '2020Q1'],
      ['quarter', '2020-04-01', QUARTER, '2020Q2'],
      ['month', '2020-02-15', MONTH, '202002'],
      ['week', '2020-02-15', WEEK, '2020W07'],
      ['day', '2020-02-15', DAY, '20200215'],
    ])('%s', (name, date, periodType, expected) => {
      expect(dateStringToPeriod(date, periodType)).toBe(expected);
    });
  });

  describe('periodToTimestamp', () => {
    it.each([
      ['year', '2016', 1451606400000],
      ['quarter', '2016Q1', 1451606400000],
      ['month', '201602', 1454284800000],
      ['week', '2016W06', 1454889600000],
      ['day', '20160229', 1456704000000],
    ])('%s', (name, period, expected) => {
      expect(periodToTimestamp(period)).toBe(expected);
    });
  });

  // TODO: Not sure how to convert.
  describe.skip('getCurrentPeriod', () => {
    const assertCorrectMethodInvocations = (periodType, format) => {
      const formatMethodStub = sinon.stub();
      const momentStub = sinon.stub(moment, 'utc').returns({
        format: formatMethodStub,
      });
      expect(momentStub).to.have.been.calledOnceWithExactly();
      expect(formatMethodStub).to.have.been.calledOnceWith(format);
    };

    it('year', () => {
      assertCorrectMethodInvocations(YEAR, 'YYYY');
    });

    it('month', () => {
      assertCorrectMethodInvocations(MONTH, 'YYYYMM');
    });

    it('week', () => {
      assertCorrectMethodInvocations(WEEK, 'GGGG[W]WW');
    });

    it('day', () => {
      assertCorrectMethodInvocations(DAY, 'YYYYMMDD');
    });
  });

  describe('periodToDisplayString', () => {
    it.each([
      ['2019', YEAR, '2019'],
      ['201912', YEAR, '2019'],
      ['2019W12', YEAR, '2019'],
      ['20191202', YEAR, '2019'],
      ['2019Q3', YEAR, '2019'],
    ])('year', (period, periodType, expected) => {
      expect(periodToDisplayString(period, periodType)).toBe(expected);
    });
    it.each([
      ['2019', QUARTER, 'Q1 2019'],
      ['201912', QUARTER, 'Q4 2019'],
      ['2019W49', QUARTER, 'Q4 2019'],
      ['20191202', QUARTER, 'Q4 2019'],
      ['2019Q3', QUARTER, 'Q3 2019'],
    ])('quarter', (period, periodType, expected) => {
      expect(periodToDisplayString(period, periodType)).toBe(expected);
    });
    it.each([
      ['2019', MONTH, 'Jan 2019'],
      ['201912', MONTH, 'Dec 2019'],
      ['2019W49', MONTH, 'Dec 2019'],
      ['20191202', MONTH, 'Dec 2019'],
      ['2019Q3', MONTH, 'Jul 2019'],
    ])('month', (period, periodType, expected) => {
      expect(periodToDisplayString(period, periodType)).toBe(expected);
    });
    it.each([
      ['2019', WEEK, '1st Jan 2019'],
      ['201912', WEEK, '1st Dec 2019'],
      ['2019W49', WEEK, '2nd Dec 2019'],
      ['20191202', WEEK, '2nd Dec 2019'],
      ['2019Q3', WEEK, '1st Jul 2019'],
    ])('week', (period, periodType, expected) => {
      expect(periodToDisplayString(period, periodType)).toBe(expected);
    });
    it.each([
      ['2019', DAY, '1st Jan 2019'],
      ['201912', DAY, '1st Dec 2019'],
      ['2019W48', DAY, '25th Nov 2019'],
      ['2019W49', DAY, '2nd Dec 2019'],
      ['20191202', DAY, '2nd Dec 2019'],
      ['2019Q3', DAY, '1st Jul 2019'],
    ])('day', (period, periodType, expected) => {
      expect(periodToDisplayString(period, periodType)).toBe(expected);
    });
    it.each([
      ['2019', '2019'],
      ['201912', 'Dec 2019'],
      ['20191202', '2nd Dec 2019'],
      ['2019Q3', 'Q3 2019'],
    ])('should default to the period type of the input', (period, expected) => {
      expect(periodToDisplayString(period)).toBe(expected);
    });
  });

  describe('convertToPeriod', () => {
    it('should convert to end periods by default', () => {
      expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', MONTH, true));
    });
    it.each([
      ['2016', MONTH, convertToPeriod('2016', 'month')],
      ['2016', MONTH, convertToPeriod('2016', 'MONTH')],
      ['2016', MONTH, convertToPeriod('2016', 'mOnTh')],
    ])('target type should be case insensitive', (period, periodType, expected) => {
      expect(convertToPeriod(period, periodType)).toBe(expected);
    });

    it('should throw an error if target type is not valid', () => {
      expect(() => convertToPeriod('2016', 'RANDOM')).toThrowError('not a valid period type');
    });

    it.each([
      ['2016', YEAR, true, '2016'],
      ['2016', YEAR, false, '2016'],
      ['201602', YEAR, true, '2016'],
      ['201602', YEAR, false, '2016'],
      ['2016W10', YEAR, true, '2016'],
      ['2016W10', YEAR, false, '2016'],
      ['20160229', YEAR, true, '2016'],
      ['20160229', YEAR, false, '2016'],
      ['2016Q2', YEAR, true, '2016'],
      ['2016Q2', YEAR, false, '2016'],
    ])('year', (period, periodType, isEndPeriod, expected) => {
      expect(convertToPeriod(period, periodType, isEndPeriod)).toBe(expected);
    });
    it.each([
      ['2016', MONTH, true, '201612'],
      ['2016', MONTH, false, '201601'],
      ['201602', MONTH, true, '201602'],
      ['201602', MONTH, false, '201602'],
      ['2016W09', MONTH, true, '201603'],
      ['2016W09', MONTH, false, '201602'],
      ['20160229', MONTH, true, '201602'],
      ['20160229', MONTH, false, '201602'],
      ['2016Q2', MONTH, true, '201606'],
      ['2016Q2', MONTH, false, '201604'],
    ])('month', (period, periodType, isEndPeriod, expected) => {
      expect(convertToPeriod(period, periodType, isEndPeriod)).toBe(expected);
    });
    it.each([
      ['2016', WEEK, true, '2016W52'],
      ['2016', WEEK, false, '2015W53'],
      ['201602', WEEK, true, '2016W09'],
      ['201602', WEEK, false, '2016W05'],
      ['2016W10', WEEK, true, '2016W10'],
      ['2016W10', WEEK, false, '2016W10'],
      ['20160229', WEEK, true, '2016W09'],
      ['20160229', WEEK, false, '2016W09'],
      ['201606', WEEK, true, '2016W26'],
      ['2016Q2', WEEK, true, '2016W26'],
      ['2016Q2', WEEK, false, '2016W13'],
    ])('week', (period, periodType, isEndPeriod, expected) => {
      expect(convertToPeriod(period, periodType, isEndPeriod)).toBe(expected);
    });
    it.each([
      ['2016', DAY, true, '20161231'],
      ['2016', DAY, false, '20160101'],
      ['201602', DAY, true, '20160229'],
      ['201602', DAY, false, '20160201'],
      ['2016W09', DAY, true, '20160306'],
      ['2016W09', DAY, false, '20160229'],
      ['20160229', DAY, true, '20160229'],
      ['20160229', DAY, false, '20160229'],
      ['201606', DAY, true, '20160630'],
      ['2016Q2', DAY, true, '20160630'],
      ['2016Q2', DAY, false, '20160401'],
    ])('day', (period, periodType, isEndPeriod, expected) => {
      expect(convertToPeriod(period, periodType, isEndPeriod)).toBe(expected);
    });
  });

  describe('findCoarsestPeriodType', () => {
    it.each([
      ['should return undefined if the input is empty', [], undefined],
      [
        'should return undefined if no valid period type exists in the input',
        ['RANDOM', 'INPUT'],
        undefined,
      ],
      [
        'should work with invalid period types in the input',
        [DAY, undefined, MONTH, 'RANDOM', DAY],
        MONTH,
      ],
    ])('%s', (name, periodTypes, expected) => {
      expect(findCoarsestPeriodType(periodTypes)).toBe(expected);
    });

    it.each([
      [[YEAR], YEAR],
      [[DAY, YEAR, WEEK, QUARTER, MONTH, DAY, MONTH], YEAR],
    ])('should detect an annual period', (periodType, expected) => {
      expect(findCoarsestPeriodType(periodType)).toBe(expected);
    });
    it.each([
      [[QUARTER], QUARTER],
      [[DAY, DAY, QUARTER, MONTH], QUARTER],
    ])('should detect a quarterly period', (periodType, expected) => {
      expect(findCoarsestPeriodType(periodType)).toBe(expected);
    });
    it.each([
      [[MONTH], MONTH],
      [[DAY, MONTH, WEEK, DAY], MONTH],
    ])('should detect a monthly period', (periodType, expected) => {
      expect(findCoarsestPeriodType(periodType)).toBe(expected);
    });
    it.each([
      [[WEEK], WEEK],
      [[DAY, WEEK, DAY], WEEK],
    ])('should detect a weekly period', (periodType, expected) => {
      expect(findCoarsestPeriodType(periodType)).toBe(expected);
    });
    it.each([
      [[DAY], DAY],
      [[DAY, DAY], DAY],
    ])('should detect a daily period', (periodType, expected) => {
      expect(findCoarsestPeriodType(periodType)).toBe(expected);
    });
  });

  describe('isCoarserPeriod', () => {
    it.each([
      ['NOT_A_PERIOD', '2016W22', false],
      ['2016Q1', 'NOT_A_PERIOD', false],
      ['NOT_A_PERIOD', 'NEITHER_IS_THIS', false],
    ])(
      'should return false if either of the periods are not valid',
      (period1, period2, expected) => {
        expect(isCoarserPeriod(period1, period2)).toBe(expected);
      },
    );

    it.each([
      ['2016', '2016Q2', true],
      ['201605', '2016Q2', false],
      ['2016W08', '20101010', true],
      ['2016Q2', '2013W02', true],
      ['20160502', '2010', false],
    ])('should detect if the first period is more coarse', (period1, period2, expected) => {
      expect(isCoarserPeriod(period1, period2)).toBe(expected);
    });

    it.each([
      ['2012', '2016', false],
      ['201405', '201601', false],
      ['2016W08', '2016W22', false],
      ['2016Q1', '2016Q2', false],
      ['20160505', '20111202', false],
    ])('should return false if the period types are the same', (period1, period2, expected) => {
      expect(isCoarserPeriod(period1, period2)).toBe(expected);
    });

    it('should return false if either of the periods are not valid', () => {
      expect(isCoarserPeriod('2012')).toBe(false);
      expect(isCoarserPeriod()).toBe(false);
    });
  });

  describe('getPeriodsInRange', () => {
    it.each([
      [
        'should throw an error if the start period is later than the end period',
        '20160115',
        '20160114',
        'must be earlier than or equal',
      ],
      [
        'should throw an error for periods of different types and no target type specified',
        '2016',
        '201602',
        'different period types',
      ],
    ])('%s', (name, start, end, expected) => {
      expect(() => getPeriodsInRange(start, end)).toThrowError(expected);
    });

    it.each([
      ['2016', '2017', getPeriodsInRange('2016', '2017', YEAR)],
      ['2016Q1', '2017Q4', getPeriodsInRange('2016Q1', '2017Q4', QUARTER)],
      ['201601', '201603', getPeriodsInRange('201601', '201603', MONTH)],
      ['2016W01', '2016W03', getPeriodsInRange('2016W01', '2016W03', WEEK)],
      ['20160301', '20160305', getPeriodsInRange('20160301', '20160305', DAY)],
    ])(
      'should default to the period type of the inputs if no target type specified',
      (start, end, expected) => {
        expect(getPeriodsInRange(start, end)).toStrictEqual(expected);
      },
    );

    it.each([
      ['201603', '20180403', YEAR, getPeriodsInRange('2016', '2018', YEAR)],
      ['2016', '201804', QUARTER, getPeriodsInRange('2016Q1', '2018Q2', QUARTER)],
    ])(
      'should handle inputs of mixed types when target type is specified',
      (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      },
    );

    it('should return an array with a single item if period limits are identical', () => {
      expect(getPeriodsInRange('2016', '2016')).toStrictEqual(['2016']);
    });

    describe('year', () => {
      it.each([
        ['2016', '2018', YEAR, ['2016', '2017', '2018']],
        ['2016Q1', '2018Q4', YEAR, ['2016', '2017', '2018']],
        ['2016Q4', '2018Q1', YEAR, ['2016', '2017', '2018']],
        ['201612', '201801', YEAR, ['2016', '2017', '2018']],
        ['2016W52', '2018W01', YEAR, ['2016', '2017', '2018']],
        ['20161231', '20180101', YEAR, ['2016', '2017', '2018']],
      ])('should return the years in range', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });
    });

    describe('quarter', () => {
      it.each([
        [
          '2016',
          '2017',
          QUARTER,
          ['2016Q1', '2016Q2', '2016Q3', '2016Q4', '2017Q1', '2017Q2', '2017Q3', '2017Q4'],
        ],
        ['2016Q1', '2016Q3', QUARTER, ['2016Q1', '2016Q2', '2016Q3']],
        ['201612', '201701', QUARTER, ['2016Q4', '2017Q1']],
        ['2016W52', '2017W15', QUARTER, ['2016Q4', '2017Q1', '2017Q2']],
        ['20161231', '20170401', QUARTER, ['2016Q4', '2017Q1', '2017Q2']],
      ])('should return the quarters in range', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });
    });

    describe('month', () => {
      it.each([
        [
          '2016',
          '2017',
          MONTH,
          [...getMonthPeriodsInYear('2016'), ...getMonthPeriodsInYear('2017')],
        ],
        ['2016Q3', '2016Q4', MONTH, ['201607', '201608', '201609', '201610', '201611', '201612']],
        ['201601', '201603', MONTH, ['201601', '201602', '201603']],
        ['2016W01', '2016W09', MONTH, ['201601', '201602', '201603']],
        ['20160112', '20160304', MONTH, ['201601', '201602', '201603']],
      ])('should return the months in range', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });

      it.each([
        ['201612', '201701', MONTH, ['201612', '201701']],
        ['201611', '201702', MONTH, ['201611', '201612', '201701', '201702']],
      ])('should handle crossing year boundary', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });

      it.each([
        ['2016Q4', '2017Q1', MONTH, ['201610', '201611', '201612', '201701', '201702', '201703']],
      ])(
        'should handle crossing year boundary with quarters',
        (start, end, targetType, expected) => {
          expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
        },
      );
    });

    describe('week', () => {
      it.each([
        [
          '2016',
          '2017',
          WEEK,
          ['2015W53', ...createWeekPeriods('2016', 1, 52), ...createWeekPeriods('2017', 1, 52)],
        ],
        ['201601', '201603', WEEK, ['2015W53', ...createWeekPeriods('2016', 1, 13)]],
        ['2016W01', '2016W14', WEEK, createWeekPeriods('2016', 1, 14)],
        ['20160111', '20160117', WEEK, ['2016W02']],
        ['20160110', '20160116', WEEK, ['2016W01', '2016W02']],
      ])('should return the weeks in range', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });

      it.each([
        ['20151227', '20160101', WEEK, ['2015W52', '2015W53']],
        ['20161231', '20170102', WEEK, ['2016W52', '2017W01']],
      ])('should handle crossing year boundary', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });
    });

    describe('day', () => {
      it.each([
        ['20160101', '20160103', DAY, ['20160101', '20160102', '20160103']],
        ['201601', '201601', DAY, getDayPeriodsInMonth('201601', 31)],
      ])('should return the days in range', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });

      it.each([
        ['20161231', '20170101', DAY, ['20161231', '20170101']],
        ['20161230', '20170102', DAY, ['20161230', '20161231', '20170101', '20170102']],
      ])('should handle crossing year boundary', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });

      it.each([
        ['20160731', '20160801', DAY, ['20160731', '20160801']],
        ['20160730', '20160802', DAY, ['20160730', '20160731', '20160801', '20160802']],
      ])('should handle crossing month boundary', (start, end, targetType, expected) => {
        expect(getPeriodsInRange(start, end, targetType)).toStrictEqual(expected);
      });

      it.each([
        [
          'should handle February days in a non leap year',
          '20170227',
          '20170301',
          ['20170227', '20170228', '20170301'],
        ],
        [
          'should handle February days in a leap year',
          '20160227',
          '20160301',
          ['20160227', '20160228', '20160229', '20160301'],
        ],
      ])('%s', (name, start, end, expected) => {
        expect(getPeriodsInRange(start, end)).toStrictEqual(expected);
      });
    });
  });
});
