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

    it('should return undefined for invalid input', () => {
      expect(periodToType('20165')).toBeUndefined();
      expect(periodToType('2016W5')).toBeUndefined();
      expect(periodToType('!VALID')).toBeUndefined();
      expect(periodToType('!VALID_WITH_W')).toBeUndefined();
      expect(periodToType('W122020')).toBeUndefined();
      expect(periodToType('2021Q10')).toBeUndefined();
    });

    it('year', () => {
      expect(periodToType('2016')).toBe(YEAR);
    });

    it('quarter', () => {
      expect(periodToType('2016Q1')).toBe(QUARTER);
    });

    it('month', () => {
      expect(periodToType('201605')).toBe(MONTH);
    });

    it('week', () => {
      expect(periodToType('2016W05')).toBe(WEEK);
    });

    it('day', () => {
      expect(periodToType('20160501')).toBe(DAY);
    });
  });

  describe('isValidPeriod', () => {
    it('should return false for empty input', () => {
      expect(isValidPeriod()).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(isValidPeriod('20165')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isValidPeriod(2016)).toBe(false);
      expect(isValidPeriod(['2', '0', '2', '0', '0', '2'])).toBe(false);
      expect(isValidPeriod({ period: '202002' })).toBe(false);
      expect(isValidPeriod(true)).toBe(false);
      expect(isValidPeriod(moment())).toBe(false);
    });

    it('should return true for valid periods', () => {
      expect(isValidPeriod('2016')).toBe(true);
      expect(isValidPeriod('201605')).toBe(true);
      expect(isValidPeriod('2016W12')).toBe(true);
      expect(isValidPeriod('2016Q2')).toBe(true);
      expect(isValidPeriod('20160502')).toBe(true);
    });
  });

  describe('comparePeriods', () => {
    describe('year', () => {
      it('>', () => {
        expect(comparePeriods('2020', '2019')).toBeGreaterThan(0);
        expect(comparePeriods('2020', '2020Q3')).toBeGreaterThan(0);
        expect(comparePeriods('2020', '202011')).toBeGreaterThan(0);
        expect(comparePeriods('2020', '2020W52')).toBeGreaterThan(0);
        expect(comparePeriods('2020', '20201230')).toBeGreaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('2020', '2020')).toBe(0);
        expect(comparePeriods('2020', '2020Q4')).toBe(0);
        expect(comparePeriods('2020', '202012')).toBe(0);
        expect(comparePeriods('2020', '20201231')).toBe(0);
      });

      it('<', () => {
        expect(comparePeriods('2020', '2021')).toBeLessThan(0);
        expect(comparePeriods('2020', '2021Q1')).toBeLessThan(0);
        expect(comparePeriods('2020', '202101')).toBeLessThan(0);
        expect(comparePeriods('2020', '2021W01')).toBeLessThan(0);
        expect(comparePeriods('2020', '20210101')).toBeLessThan(0);
      });
    });

    describe('quarter', () => {
      it('>', () => {
        expect(comparePeriods('2020Q1', '2019')).toBeGreaterThan(0);
        expect(comparePeriods('2020Q1', '2019Q4')).toBeGreaterThan(0);
        expect(comparePeriods('2020Q1', '201912')).toBeGreaterThan(0);
        expect(comparePeriods('2020Q1', '2019W52')).toBeGreaterThan(0);
        expect(comparePeriods('2020Q1', '20191231')).toBeGreaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('2020Q4', '2020')).toBe(0);
        expect(comparePeriods('2020Q4', '2020Q4')).toBe(0);
        expect(comparePeriods('2020Q4', '202012')).toBe(0);
        expect(comparePeriods('2020Q4', '20201231')).toBe(0);
      });

      it('<', () => {
        expect(comparePeriods('2020Q4', '2021')).toBeLessThan(0);
        expect(comparePeriods('2020Q4', '2021Q1')).toBeLessThan(0);
        expect(comparePeriods('2020Q4', '202101')).toBeLessThan(0);
        expect(comparePeriods('2020Q4', '2021W01')).toBeLessThan(0);
        expect(comparePeriods('2020Q4', '20210101')).toBeLessThan(0);
      });
    });

    describe('month', () => {
      it('>', () => {
        expect(comparePeriods('202001', '2019')).toBeGreaterThan(0);
        expect(comparePeriods('202001', '2019Q4')).toBeGreaterThan(0);
        expect(comparePeriods('202001', '201912')).toBeGreaterThan(0);
        expect(comparePeriods('202001', '2019W52')).toBeGreaterThan(0);
        expect(comparePeriods('202001', '20191231')).toBeGreaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('202012', '2020')).toBe(0);
        expect(comparePeriods('202012', '2020Q4')).toBe(0);
        expect(comparePeriods('202012', '202012')).toBe(0);
        expect(comparePeriods('202012', '20201231')).toBe(0);
      });

      it('<', () => {
        expect(comparePeriods('202012', '2021')).toBeLessThan(0);
        expect(comparePeriods('202012', '2021Q1')).toBeLessThan(0);
        expect(comparePeriods('202012', '202101')).toBeLessThan(0);
        expect(comparePeriods('202012', '2021W01')).toBeLessThan(0);
        expect(comparePeriods('202012', '20210101')).toBeLessThan(0);
      });
    });

    describe('week', () => {
      it('>', () => {
        expect(comparePeriods('2020W01', '2019')).toBeGreaterThan(0);
        expect(comparePeriods('2020W01', '2019Q4')).toBeGreaterThan(0);
        expect(comparePeriods('2020W01', '201912')).toBeGreaterThan(0);
        expect(comparePeriods('2020W01', '2019W52')).toBeGreaterThan(0);
        expect(comparePeriods('2020W01', '20191231')).toBeGreaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('2020W53', '2020W53')).toBe(0);
        expect(comparePeriods('2020W52', '20201227')).toBe(0);
        expect(comparePeriods('2020W53', '20210103')).toBe(0);
      });

      it('<', () => {
        expect(comparePeriods('2020W52', '2021')).toBeLessThan(0);
        expect(comparePeriods('2020W52', '2021Q1')).toBeLessThan(0);
        expect(comparePeriods('2020W52', '202101')).toBeLessThan(0);
        expect(comparePeriods('2020W52', '2021W01')).toBeLessThan(0);
        expect(comparePeriods('2020W52', '20201228')).toBeLessThan(0);
        expect(comparePeriods('2020W53', '20210301')).toBeLessThan(0);
      });
    });

    describe('day', () => {
      it('>', () => {
        expect(comparePeriods('20200101', '2019')).toBeGreaterThan(0);
        expect(comparePeriods('20200101', '2019Q4')).toBeGreaterThan(0);
        expect(comparePeriods('20200101', '201912')).toBeGreaterThan(0);
        expect(comparePeriods('20191230', '2019W52')).toBeGreaterThan(0);
        expect(comparePeriods('20200101', '20191231')).toBeGreaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('20201231', '2020')).toBe(0);
        expect(comparePeriods('20201231', '202012')).toBe(0);
        expect(comparePeriods('20201231', '2020Q4')).toBe(0);
        expect(comparePeriods('20201227', '2020W52')).toBe(0);
        expect(comparePeriods('20210103', '2020W53')).toBe(0);
      });

      it('<', () => {
        expect(comparePeriods('20201231', '2021')).toBeLessThan(0);
        expect(comparePeriods('20201231', '2021Q1')).toBeLessThan(0);
        expect(comparePeriods('20201231', '202101')).toBeLessThan(0);
        expect(comparePeriods('20201231', '2021W01')).toBeLessThan(0);
        expect(comparePeriods('20201231', '20210101')).toBeLessThan(0);
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
    it('should return the period type regardless of case', () => {
      expect(parsePeriodType('YEAR')).toBe(YEAR);
      expect(parsePeriodType('quaRter')).toBe(QUARTER);
      expect(parsePeriodType('mOnTh')).toBe(MONTH);
      expect(parsePeriodType('wEEk')).toBe(WEEK);
      expect(parsePeriodType('day')).toBe(DAY);
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

    it('year', () => {
      expect(momentToPeriod(momentStub, YEAR)).toBe('YYYY');
    });

    it('quarter', () => {
      expect(momentToPeriod(momentStub, QUARTER)).toBe('YYYY[Q]Q');
    });

    it('month', () => {
      expect(momentToPeriod(momentStub, MONTH)).toBe('YYYYMM');
    });

    it('week', () => {
      expect(momentToPeriod(momentStub, WEEK)).toBe('GGGG[W]WW');
    });

    it('day', () => {
      expect(momentToPeriod(momentStub, DAY)).toBe('YYYYMMDD');
    });
  });

  describe('dateStringToPeriod', () => {
    it('should use `day` by default', () => {
      expect(dateStringToPeriod('2020-02-15')).toBe(dateStringToPeriod('2020-02-15', DAY));
    });

    it('should convert compatible date formats', () => {
      expect(dateStringToPeriod('2020-02-15')).toBe('20200215');
      expect(dateStringToPeriod('2020-02-15 10:18:00')).toBe('20200215');
    });

    it('year', () => {
      expect(dateStringToPeriod('2020-02-15', YEAR)).toBe('2020');
    });

    it('quarter', () => {
      expect(dateStringToPeriod('2020-02-15', QUARTER)).toBe('2020Q1');
      expect(dateStringToPeriod('2020-04-01', QUARTER)).toBe('2020Q2');
    });

    it('month', () => {
      expect(dateStringToPeriod('2020-02-15', MONTH)).toBe('202002');
    });

    it('week', () => {
      expect(dateStringToPeriod('2020-02-15', WEEK)).toBe('2020W07');
    });

    it('day', () => {
      expect(dateStringToPeriod('2020-02-15', DAY)).toBe('20200215');
    });
  });

  describe('periodToTimestamp', () => {
    it('year', () => {
      expect(periodToTimestamp('2016')).toBe(1451606400000);
    });

    it('quarter', () => {
      expect(periodToTimestamp('2016Q1')).toBe(1451606400000);
    });

    it('month', () => {
      expect(periodToTimestamp('201602')).toBe(1454284800000);
    });

    it('week', () => {
      expect(periodToTimestamp('2016W06')).toBe(1454889600000);
    });

    it('day', () => {
      expect(periodToTimestamp('20160229')).toBe(1456704000000);
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
    it('year', () => {
      expect(periodToDisplayString('2019', YEAR)).toBe('2019');
      expect(periodToDisplayString('201912', YEAR)).toBe('2019');
      expect(periodToDisplayString('2019W12', YEAR)).toBe('2019');
      expect(periodToDisplayString('20191202', YEAR)).toBe('2019');
      expect(periodToDisplayString('2019Q3', YEAR)).toBe('2019');
    });

    it('quarter', () => {
      expect(periodToDisplayString('2019', QUARTER)).toBe('Q1 2019');
      expect(periodToDisplayString('201912', QUARTER)).toBe('Q4 2019');
      expect(periodToDisplayString('2019W49', QUARTER)).toBe('Q4 2019');
      expect(periodToDisplayString('20191202', QUARTER)).toBe('Q4 2019');
      expect(periodToDisplayString('2019Q3', QUARTER)).toBe('Q3 2019');
    });

    it('month', () => {
      expect(periodToDisplayString('2019', MONTH)).toBe('Jan 2019');
      expect(periodToDisplayString('201912', MONTH)).toBe('Dec 2019');
      expect(periodToDisplayString('2019W49', MONTH)).toBe('Dec 2019');
      expect(periodToDisplayString('20191202', MONTH)).toBe('Dec 2019');
      expect(periodToDisplayString('2019Q3', MONTH)).toBe('Jul 2019');
    });

    it('week', () => {
      expect(periodToDisplayString('2019', WEEK)).toBe('1st Jan 2019');
      expect(periodToDisplayString('201912', WEEK)).toBe('1st Dec 2019');
      expect(periodToDisplayString('2019W49', WEEK)).toBe('2nd Dec 2019');
      expect(periodToDisplayString('20191202', WEEK)).toBe('2nd Dec 2019');
      expect(periodToDisplayString('2019Q3', WEEK)).toBe('1st Jul 2019');
    });

    it('day', () => {
      expect(periodToDisplayString('2019', DAY)).toBe('1st Jan 2019');
      expect(periodToDisplayString('201912', DAY)).toBe('1st Dec 2019');
      expect(periodToDisplayString('2019W48', DAY)).toBe('25th Nov 2019');
      expect(periodToDisplayString('2019W49', DAY)).toBe('2nd Dec 2019');
      expect(periodToDisplayString('20191202', DAY)).toBe('2nd Dec 2019');
      expect(periodToDisplayString('2019Q3', DAY)).toBe('1st Jul 2019');
    });

    it('should default to the period type of the input', () => {
      expect(periodToDisplayString('2019')).toBe('2019');
      expect(periodToDisplayString('201912')).toBe('Dec 2019');
      expect(periodToDisplayString('20191202')).toBe('2nd Dec 2019');
      expect(periodToDisplayString('2019Q3')).toBe('Q3 2019');
    });
  });

  describe('convertToPeriod', () => {
    it('should convert to end periods by default', () => {
      expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', MONTH, true));
    });

    it('target type should be case insensitive', () => {
      expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', 'month'));
      expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', 'MONTH'));
      expect(convertToPeriod('2016', MONTH)).toBe(convertToPeriod('2016', 'mOnTh'));
    });

    it('should throw an error if target type is not valid', () => {
      expect(() => convertToPeriod('2016', 'RANDOM')).toThrowError('not a valid period type');
    });

    it('year', () => {
      expect(convertToPeriod('2016', YEAR, true)).toBe('2016');
      expect(convertToPeriod('2016', YEAR, false)).toBe('2016');
      expect(convertToPeriod('201602', YEAR, true)).toBe('2016');
      expect(convertToPeriod('201602', YEAR, false)).toBe('2016');
      expect(convertToPeriod('2016W10', YEAR, true)).toBe('2016');
      expect(convertToPeriod('2016W10', YEAR, false)).toBe('2016');
      expect(convertToPeriod('20160229', YEAR, true)).toBe('2016');
      expect(convertToPeriod('20160229', YEAR, false)).toBe('2016');
      expect(convertToPeriod('2016Q2', YEAR, true)).toBe('2016');
      expect(convertToPeriod('2016Q2', YEAR, false)).toBe('2016');
    });

    it('month', () => {
      expect(convertToPeriod('2016', MONTH, true)).toBe('201612');
      expect(convertToPeriod('2016', MONTH, false)).toBe('201601');
      expect(convertToPeriod('201602', MONTH, true)).toBe('201602');
      expect(convertToPeriod('201602', MONTH, false)).toBe('201602');
      expect(convertToPeriod('2016W09', MONTH, true)).toBe('201603');
      expect(convertToPeriod('2016W09', MONTH, false)).toBe('201602');
      expect(convertToPeriod('20160229', MONTH, true)).toBe('201602');
      expect(convertToPeriod('20160229', MONTH, false)).toBe('201602');
      expect(convertToPeriod('2016Q2', MONTH, true)).toBe('201606');
      expect(convertToPeriod('2016Q2', MONTH, false)).toBe('201604');
    });

    it('week', () => {
      expect(convertToPeriod('2016', WEEK, true)).toBe('2016W52');
      expect(convertToPeriod('2016', WEEK, false)).toBe('2015W53');
      expect(convertToPeriod('201602', WEEK, true)).toBe('2016W09');
      expect(convertToPeriod('201602', WEEK, false)).toBe('2016W05');
      expect(convertToPeriod('2016W10', WEEK, true)).toBe('2016W10');
      expect(convertToPeriod('2016W10', WEEK, false)).toBe('2016W10');
      expect(convertToPeriod('20160229', WEEK, true)).toBe('2016W09');
      expect(convertToPeriod('20160229', WEEK, false)).toBe('2016W09');
      expect(convertToPeriod('201606', WEEK, true)).toBe('2016W26');
      expect(convertToPeriod('2016Q2', WEEK, true)).toBe('2016W26');
      expect(convertToPeriod('2016Q2', WEEK, false)).toBe('2016W13');
    });

    it('day', () => {
      expect(convertToPeriod('2016', DAY, true)).toBe('20161231');
      expect(convertToPeriod('2016', DAY, false)).toBe('20160101');
      expect(convertToPeriod('201602', DAY, true)).toBe('20160229');
      expect(convertToPeriod('201602', DAY, false)).toBe('20160201');
      expect(convertToPeriod('2016W09', DAY, true)).toBe('20160306');
      expect(convertToPeriod('2016W09', DAY, false)).toBe('20160229');
      expect(convertToPeriod('20160229', DAY, true)).toBe('20160229');
      expect(convertToPeriod('20160229', DAY, false)).toBe('20160229');
      expect(convertToPeriod('201606', DAY, true)).toBe('20160630');
      expect(convertToPeriod('2016Q2', DAY, true)).toBe('20160630');
      expect(convertToPeriod('2016Q2', DAY, false)).toBe('20160401');
    });
  });

  describe('findCoarsestPeriodType', () => {
    it('should return undefined if the input is empty', () => {
      expect(findCoarsestPeriodType([])).toBeUndefined();
    });

    it('should return undefined if no valid period type exists in the input', () => {
      expect(findCoarsestPeriodType(['RANDOM', 'INPUT'])).toBeUndefined();
    });

    it('should work with invalid period types in the input', () => {
      expect(findCoarsestPeriodType([DAY, undefined, MONTH, 'RANDOM', DAY])).toBe(MONTH);
    });

    it('should detect an annual period', () => {
      expect(findCoarsestPeriodType([YEAR])).toBe(YEAR);
      expect(findCoarsestPeriodType([DAY, YEAR, WEEK, QUARTER, MONTH, DAY, MONTH])).toBe(YEAR);
    });

    it('should detect a quarterly period', () => {
      expect(findCoarsestPeriodType([QUARTER])).toBe(QUARTER);
      expect(findCoarsestPeriodType([DAY, DAY, QUARTER, MONTH])).toBe(QUARTER);
    });

    it('should detect a monthly period', () => {
      expect(findCoarsestPeriodType([MONTH])).toBe(MONTH);
      expect(findCoarsestPeriodType([DAY, MONTH, WEEK, DAY])).toBe(MONTH);
    });

    it('should detect a weekly period', () => {
      expect(findCoarsestPeriodType([WEEK])).toBe(WEEK);
      expect(findCoarsestPeriodType([DAY, WEEK, DAY])).toBe(WEEK);
    });

    it('should detect a daily period', () => {
      expect(findCoarsestPeriodType([DAY])).toBe(DAY);
      expect(findCoarsestPeriodType([DAY, DAY])).toBe(DAY);
    });
  });

  describe('isCoarserPeriod', () => {
    it('should return false if either of the periods are not valid', () => {
      expect(isCoarserPeriod('2012')).toBe(false);
      expect(isCoarserPeriod()).toBe(false);
      expect(isCoarserPeriod('NOT_A_PERIOD', '2016W22')).toBe(false);
      expect(isCoarserPeriod('2016Q1', 'NOT_A_PERIOD')).toBe(false);
      expect(isCoarserPeriod('NOT_A_PERIOD', 'NEITHER_IS_THIS')).toBe(false);
    });
    it('should detect if the first period is more coarse', () => {
      expect(isCoarserPeriod('2016', '2016Q2')).toBe(true);
      expect(isCoarserPeriod('201605', '2016Q2')).toBe(false);
      expect(isCoarserPeriod('2016W08', '20101010')).toBe(true);
      expect(isCoarserPeriod('2016Q2', '2013W02')).toBe(true);
      expect(isCoarserPeriod('20160502', '2010')).toBe(false);
    });
    it('should return false if the period types are the same', () => {
      expect(isCoarserPeriod('2012', '2016')).toBe(false);
      expect(isCoarserPeriod('201405', '201601')).toBe(false);
      expect(isCoarserPeriod('2016W08', '2016W22')).toBe(false);
      expect(isCoarserPeriod('2016Q1', '2016Q2')).toBe(false);
      expect(isCoarserPeriod('20160505', '20111202')).toBe(false);
    });
  });

  describe('getPeriodsInRange', () => {
    it('should throw an error if the start period is later than the end period', () => {
      expect(() => getPeriodsInRange('20160115', '20160114')).toThrowError(
        'must be earlier than or equal',
      );
    });

    it('should throw an error for periods of different types and no target type specified', () => {
      expect(() => getPeriodsInRange('2016', '201602')).toThrowError('different period types');
    });

    it('should default to the period type of the inputs if no target type specified', () => {
      expect(getPeriodsInRange('2016', '2017')).toEqual(getPeriodsInRange('2016', '2017', YEAR));
      expect(getPeriodsInRange('2016Q1', '2017Q4')).toEqual(
        getPeriodsInRange('2016Q1', '2017Q4', QUARTER),
      );
      expect(getPeriodsInRange('201601', '201603')).toEqual(
        getPeriodsInRange('201601', '201603', MONTH),
      );
      expect(getPeriodsInRange('2016W01', '2016W03')).toEqual(
        getPeriodsInRange('2016W01', '2016W03', WEEK),
      );
      expect(getPeriodsInRange('20160301', '20160305')).toEqual(
        getPeriodsInRange('20160301', '20160305', DAY),
      );
    });

    it('should handle inputs of mixed types when target type is specified', () => {
      expect(getPeriodsInRange('201603', '20180403', YEAR)).toEqual(
        getPeriodsInRange('2016', '2018', YEAR),
      );
      expect(getPeriodsInRange('2016', '201804', QUARTER)).toEqual(
        getPeriodsInRange('2016Q1', '2018Q2', QUARTER),
      );
      expect(getPeriodsInRange('2016', '20180403', MONTH)).toEqual(
        getPeriodsInRange('201601', '201804', MONTH),
      );
      expect(getPeriodsInRange('2016', '20180403', WEEK)).toEqual(
        getPeriodsInRange('2015W53', '2018W14', WEEK),
      );
      expect(getPeriodsInRange('2016', '201804', DAY)).toEqual(
        getPeriodsInRange('20160101', '20180430', DAY),
      );
    });

    it('should return an array with a single item if period limits are identical', () => {
      expect(getPeriodsInRange('2016', '2016')).toEqual(['2016']);
    });

    describe('year', () => {
      it('should return the years in range', () => {
        expect(getPeriodsInRange('2016', '2018', YEAR)).toEqual(['2016', '2017', '2018']);
        expect(getPeriodsInRange('2016Q1', '2018Q4', YEAR)).toEqual(['2016', '2017', '2018']);
        expect(getPeriodsInRange('2016Q4', '2018Q1', YEAR)).toEqual(['2016', '2017', '2018']);
        expect(getPeriodsInRange('201612', '201801', YEAR)).toEqual(['2016', '2017', '2018']);
        expect(getPeriodsInRange('2016W52', '2018W01', YEAR)).toEqual(['2016', '2017', '2018']);
        expect(getPeriodsInRange('20161231', '20180101', YEAR)).toEqual(['2016', '2017', '2018']);
      });
    });

    describe('quarter', () => {
      it('should return the quarters in range', () => {
        expect(getPeriodsInRange('2016', '2017', QUARTER)).toEqual([
          '2016Q1',
          '2016Q2',
          '2016Q3',
          '2016Q4',
          '2017Q1',
          '2017Q2',
          '2017Q3',
          '2017Q4',
        ]);
        expect(getPeriodsInRange('2016Q1', '2016Q3', QUARTER)).toEqual([
          '2016Q1',
          '2016Q2',
          '2016Q3',
        ]);
        expect(getPeriodsInRange('201612', '201701', QUARTER)).toEqual(['2016Q4', '2017Q1']);
        expect(getPeriodsInRange('2016W52', '2017W15', QUARTER)).toEqual([
          '2016Q4',
          '2017Q1',
          '2017Q2',
        ]);
        expect(getPeriodsInRange('20161231', '20170401', QUARTER)).toEqual([
          '2016Q4',
          '2017Q1',
          '2017Q2',
        ]);
      });
    });

    describe('month', () => {
      it('should return the months in range', () => {
        expect(getPeriodsInRange('2016', '2017', MONTH)).toEqual([
          ...getMonthPeriodsInYear('2016'),
          ...getMonthPeriodsInYear('2017'),
        ]);
        expect(getPeriodsInRange('2016Q3', '2016Q4', MONTH)).toEqual([
          '201607',
          '201608',
          '201609',
          '201610',
          '201611',
          '201612',
        ]);
        expect(getPeriodsInRange('201601', '201603', MONTH)).toEqual([
          '201601',
          '201602',
          '201603',
        ]);
        expect(getPeriodsInRange('2016W01', '2016W09', MONTH)).toEqual([
          '201601',
          '201602',
          '201603',
        ]);
        expect(getPeriodsInRange('20160112', '20160304', MONTH)).toEqual([
          '201601',
          '201602',
          '201603',
        ]);
      });

      it('should handle crossing year boundary', () => {
        expect(getPeriodsInRange('201612', '201701', MONTH)).toEqual(['201612', '201701']);
        expect(getPeriodsInRange('201611', '201702', MONTH)).toEqual([
          '201611',
          '201612',
          '201701',
          '201702',
        ]);
      });

      it('should handle crossing year boundary with quarters', () => {
        expect(getPeriodsInRange('2016Q4', '2017Q1', MONTH)).toEqual([
          '201610',
          '201611',
          '201612',
          '201701',
          '201702',
          '201703',
        ]);
      });
    });

    describe('week', () => {
      it('should return the weeks in range', () => {
        expect(getPeriodsInRange('2016', '2017', WEEK)).toEqual([
          '2015W53',
          ...createWeekPeriods('2016', 1, 52),
          ...createWeekPeriods('2017', 1, 52),
        ]);
        expect(getPeriodsInRange('201601', '201603', WEEK)).toEqual([
          '2015W53',
          ...createWeekPeriods('2016', 1, 13),
        ]);
        expect(getPeriodsInRange('2016W01', '2016W14', WEEK)).toEqual(
          createWeekPeriods('2016', 1, 14),
        );
        expect(getPeriodsInRange('20160111', '20160117', WEEK)).toEqual(['2016W02']);
        expect(getPeriodsInRange('20160110', '20160116', WEEK)).toEqual(['2016W01', '2016W02']);
      });

      it('should handle crossing year boundary', () => {
        expect(getPeriodsInRange('20151227', '20160101', WEEK)).toEqual(['2015W52', '2015W53']);
        expect(getPeriodsInRange('20161231', '20170102', WEEK)).toEqual(['2016W52', '2017W01']);
      });
    });

    describe('day', () => {
      it('should return the days in range', () => {
        expect(getPeriodsInRange('20160101', '20160103', DAY)).toEqual([
          '20160101',
          '20160102',
          '20160103',
        ]);
        expect(getPeriodsInRange('201601', '201601', DAY)).toEqual(
          getDayPeriodsInMonth('201601', 31),
        );
      });

      it('should handle crossing year boundary', () => {
        expect(getPeriodsInRange('20161231', '20170101', DAY)).toEqual(['20161231', '20170101']);
        expect(getPeriodsInRange('20161230', '20170102', DAY)).toEqual([
          '20161230',
          '20161231',
          '20170101',
          '20170102',
        ]);
      });

      it('should handle crossing month boundary', () => {
        expect(getPeriodsInRange('20160731', '20160801', DAY)).toEqual(['20160731', '20160801']);
        expect(getPeriodsInRange('20160730', '20160802', DAY)).toEqual([
          '20160730',
          '20160731',
          '20160801',
          '20160802',
        ]);
      });

      it('should handle February days in a non leap year', () => {
        expect(getPeriodsInRange('20170227', '20170301')).toEqual([
          '20170227',
          '20170228',
          '20170301',
        ]);
      });

      it('should handle February days in a leap year', () => {
        expect(getPeriodsInRange('20160227', '20160301')).toEqual([
          '20160227',
          '20160228',
          '20160229',
          '20160301',
        ]);
      });
    });
  });
});
