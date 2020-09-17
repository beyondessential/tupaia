/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
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
      expect(periodToType()).to.equal(undefined);
    });

    it('should return undefined for invalid input', () => {
      expect(periodToType('20165')).to.equal(undefined);
      expect(periodToType('2016W5')).to.equal(undefined);
      expect(periodToType('!VALID')).to.equal(undefined);
      expect(periodToType('!VALID_WITH_W')).to.equal(undefined);
      expect(periodToType('W122020')).to.equal(undefined);
      expect(periodToType('2021Q10')).to.equal(undefined);
    });

    it('year', () => {
      expect(periodToType('2016')).to.equal(YEAR);
    });

    it('quarter', () => {
      expect(periodToType('2016Q1')).to.equal(QUARTER);
    });

    it('month', () => {
      expect(periodToType('201605')).to.equal(MONTH);
    });

    it('week', () => {
      expect(periodToType('2016W05')).to.equal(WEEK);
    });

    it('day', () => {
      expect(periodToType('20160501')).to.equal(DAY);
    });
  });

  describe('isValidPeriod', () => {
    it('should return false for empty input', () => {
      expect(isValidPeriod()).to.equal(false);
    });

    it('should return false for invalid input', () => {
      expect(isValidPeriod('20165')).to.equal(false);
    });

    it('should return false for non-strings', () => {
      expect(isValidPeriod(2016)).to.equal(false);
      expect(isValidPeriod(['2', '0', '2', '0', '0', '2'])).to.equal(false);
      expect(isValidPeriod({ period: '202002' })).to.equal(false);
      expect(isValidPeriod(true)).to.equal(false);
      expect(isValidPeriod(moment())).to.equal(false);
    });

    it('should return true for valid periods', () => {
      expect(isValidPeriod('2016')).to.equal(true);
      expect(isValidPeriod('201605')).to.equal(true);
      expect(isValidPeriod('2016W12')).to.equal(true);
      expect(isValidPeriod('2016Q2')).to.equal(true);
      expect(isValidPeriod('20160502')).to.equal(true);
    });
  });

  describe('comparePeriods', () => {
    describe('year', () => {
      it('>', () => {
        expect(comparePeriods('2020', '2019')).to.be.greaterThan(0);
        expect(comparePeriods('2020', '2020Q3')).to.be.greaterThan(0);
        expect(comparePeriods('2020', '202011')).to.be.greaterThan(0);
        expect(comparePeriods('2020', '2020W52')).to.be.greaterThan(0);
        expect(comparePeriods('2020', '20201230')).to.be.greaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('2020', '2020')).to.equal(0);
        expect(comparePeriods('2020', '2020Q4')).to.equal(0);
        expect(comparePeriods('2020', '202012')).to.equal(0);
        expect(comparePeriods('2020', '20201231')).to.equal(0);
      });

      it('<', () => {
        expect(comparePeriods('2020', '2021')).to.be.lessThan(0);
        expect(comparePeriods('2020', '2021Q1')).to.be.lessThan(0);
        expect(comparePeriods('2020', '202101')).to.be.lessThan(0);
        expect(comparePeriods('2020', '2021W01')).to.be.lessThan(0);
        expect(comparePeriods('2020', '20210101')).to.be.lessThan(0);
      });
    });

    describe('quarter', () => {
      it('>', () => {
        expect(comparePeriods('2020Q1', '2019')).to.be.greaterThan(0);
        expect(comparePeriods('2020Q1', '2019Q4')).to.be.greaterThan(0);
        expect(comparePeriods('2020Q1', '201912')).to.be.greaterThan(0);
        expect(comparePeriods('2020Q1', '2019W52')).to.be.greaterThan(0);
        expect(comparePeriods('2020Q1', '20191231')).to.be.greaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('2020Q4', '2020')).to.equal(0);
        expect(comparePeriods('2020Q4', '2020Q4')).to.equal(0);
        expect(comparePeriods('2020Q4', '202012')).to.equal(0);
        expect(comparePeriods('2020Q4', '20201231')).to.equal(0);
      });

      it('<', () => {
        expect(comparePeriods('2020Q4', '2021')).to.be.lessThan(0);
        expect(comparePeriods('2020Q4', '2021Q1')).to.be.lessThan(0);
        expect(comparePeriods('2020Q4', '202101')).to.be.lessThan(0);
        expect(comparePeriods('2020Q4', '2021W01')).to.be.lessThan(0);
        expect(comparePeriods('2020Q4', '20210101')).to.be.lessThan(0);
      });
    });

    describe('month', () => {
      it('>', () => {
        expect(comparePeriods('202001', '2019')).to.be.greaterThan(0);
        expect(comparePeriods('202001', '2019Q4')).to.be.greaterThan(0);
        expect(comparePeriods('202001', '201912')).to.be.greaterThan(0);
        expect(comparePeriods('202001', '2019W52')).to.be.greaterThan(0);
        expect(comparePeriods('202001', '20191231')).to.be.greaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('202012', '2020')).to.equal(0);
        expect(comparePeriods('202012', '2020Q4')).to.equal(0);
        expect(comparePeriods('202012', '202012')).to.equal(0);
        expect(comparePeriods('202012', '20201231')).to.equal(0);
      });

      it('<', () => {
        expect(comparePeriods('202012', '2021')).to.be.lessThan(0);
        expect(comparePeriods('202012', '2021Q1')).to.be.lessThan(0);
        expect(comparePeriods('202012', '202101')).to.be.lessThan(0);
        expect(comparePeriods('202012', '2021W01')).to.be.lessThan(0);
        expect(comparePeriods('202012', '20210101')).to.be.lessThan(0);
      });
    });

    describe('week', () => {
      it('>', () => {
        expect(comparePeriods('2020W01', '2019')).to.be.greaterThan(0);
        expect(comparePeriods('2020W01', '2019Q4')).to.be.greaterThan(0);
        expect(comparePeriods('2020W01', '201912')).to.be.greaterThan(0);
        expect(comparePeriods('2020W01', '2019W52')).to.be.greaterThan(0);
        expect(comparePeriods('2020W01', '20191231')).to.be.greaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('2020W53', '2020W53')).to.equal(0);
        expect(comparePeriods('2020W52', '20201227')).to.equal(0);
        expect(comparePeriods('2020W53', '20210103')).to.equal(0);
      });

      it('<', () => {
        expect(comparePeriods('2020W52', '2021')).to.be.lessThan(0);
        expect(comparePeriods('2020W52', '2021Q1')).to.be.lessThan(0);
        expect(comparePeriods('2020W52', '202101')).to.be.lessThan(0);
        expect(comparePeriods('2020W52', '2021W01')).to.be.lessThan(0);
        expect(comparePeriods('2020W52', '20201228')).to.be.lessThan(0);
        expect(comparePeriods('2020W53', '20210301')).to.be.lessThan(0);
      });
    });

    describe('day', () => {
      it('>', () => {
        expect(comparePeriods('20200101', '2019')).to.be.greaterThan(0);
        expect(comparePeriods('20200101', '2019Q4')).to.be.greaterThan(0);
        expect(comparePeriods('20200101', '201912')).to.be.greaterThan(0);
        expect(comparePeriods('20191230', '2019W52')).to.be.greaterThan(0);
        expect(comparePeriods('20200101', '20191231')).to.be.greaterThan(0);
      });

      it('=', () => {
        expect(comparePeriods('20201231', '2020')).to.equal(0);
        expect(comparePeriods('20201231', '202012')).to.equal(0);
        expect(comparePeriods('20201231', '2020Q4')).to.equal(0);
        expect(comparePeriods('20201227', '2020W52')).to.equal(0);
        expect(comparePeriods('20210103', '2020W53')).to.equal(0);
      });

      it('<', () => {
        expect(comparePeriods('20201231', '2021')).to.be.lessThan(0);
        expect(comparePeriods('20201231', '2021Q1')).to.be.lessThan(0);
        expect(comparePeriods('20201231', '202101')).to.be.lessThan(0);
        expect(comparePeriods('20201231', '2021W01')).to.be.lessThan(0);
        expect(comparePeriods('20201231', '20210101')).to.be.lessThan(0);
      });
    });
  });

  describe('isFuturePeriod', () => {
    const currentDateStub = '2020-12-31T00:00:00Z';
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers({ now: new Date(currentDateStub) });
    });

    after(() => {
      clock.restore();
    });

    it('past', () => {
      expect(isFuturePeriod('2019')).to.be.false;
      expect(isFuturePeriod('2020Q3')).to.be.false;
      expect(isFuturePeriod('202011')).to.be.false;
      expect(isFuturePeriod('2020W52')).to.be.false;
      expect(isFuturePeriod('20201230')).to.be.false;
    });

    it('present', () => {
      expect(isFuturePeriod('2020')).to.be.false;
      expect(isFuturePeriod('2020Q4')).to.be.false;
      expect(isFuturePeriod('202012')).to.be.false;
      expect(isFuturePeriod('20201231')).to.be.false;
    });

    it('present - week period type', () => {
      // We need to match the last date of a week
      clock = sinon.useFakeTimers({ now: new Date('2020-12-27T00:00:00Z') });
      expect(isFuturePeriod('2020W52')).to.be.false;
    });

    it('future', () => {
      expect(isFuturePeriod('2021')).to.be.true;
      expect(isFuturePeriod('2021Q1')).to.be.true;
      expect(isFuturePeriod('202101')).to.be.true;
      expect(isFuturePeriod('2021W01')).to.be.true;
      expect(isFuturePeriod('2020W53')).to.be.true;
      expect(isFuturePeriod('20210101')).to.be.true;
    });
  });

  describe('parsePeriodType', () => {
    it('should return the period type regardless of case', () => {
      expect(parsePeriodType('YEAR')).to.equal(YEAR);
      expect(parsePeriodType('quaRter')).to.equal(QUARTER);
      expect(parsePeriodType('mOnTh')).to.equal(MONTH);
      expect(parsePeriodType('wEEk')).to.equal(WEEK);
      expect(parsePeriodType('day')).to.equal(DAY);
    });

    it('should throw an error for a wrong input', () => {
      const wrongValues = ['random', false, undefined, null, '201701', { MONTH: 'MONTH' }];
      wrongValues.map(wrongValue =>
        expect(() => parsePeriodType(wrongValue)).to.throw('Period type'),
      );
    });
  });

  describe('momentToPeriod', () => {
    const momentStub = { format: args => args };

    it('year', () => {
      expect(momentToPeriod(momentStub, YEAR)).to.equal('YYYY');
    });

    it('quarter', () => {
      expect(momentToPeriod(momentStub, QUARTER)).to.equal('YYYY[Q]Q');
    });

    it('month', () => {
      expect(momentToPeriod(momentStub, MONTH)).to.equal('YYYYMM');
    });

    it('week', () => {
      expect(momentToPeriod(momentStub, WEEK)).to.equal('GGGG[W]WW');
    });

    it('day', () => {
      expect(momentToPeriod(momentStub, DAY)).to.equal('YYYYMMDD');
    });
  });

  describe('dateStringToPeriod', () => {
    it('should use `day` by default', () => {
      expect(dateStringToPeriod('2020-02-15')).to.equal(dateStringToPeriod('2020-02-15', DAY));
    });

    it('should convert compatible date formats', () => {
      expect(dateStringToPeriod('2020-02-15')).to.equal('20200215');
      expect(dateStringToPeriod('2020-02-15 10:18:00')).to.equal('20200215');
    });

    it('year', () => {
      expect(dateStringToPeriod('2020-02-15', YEAR)).to.equal('2020');
    });

    it('quarter', () => {
      expect(dateStringToPeriod('2020-02-15', QUARTER)).to.equal('2020Q1');
      expect(dateStringToPeriod('2020-04-01', QUARTER)).to.equal('2020Q2');
    });

    it('month', () => {
      expect(dateStringToPeriod('2020-02-15', MONTH)).to.equal('202002');
    });

    it('week', () => {
      expect(dateStringToPeriod('2020-02-15', WEEK)).to.equal('2020W07');
    });

    it('day', () => {
      expect(dateStringToPeriod('2020-02-15', DAY)).to.equal('20200215');
    });
  });

  describe('periodToTimestamp', () => {
    it('year', () => {
      expect(periodToTimestamp('2016')).to.equal(1451606400000);
    });

    it('quarter', () => {
      expect(periodToTimestamp('2016Q1')).to.equal(1451606400000);
    });

    it('month', () => {
      expect(periodToTimestamp('201602')).to.equal(1454284800000);
    });

    it('week', () => {
      expect(periodToTimestamp('2016W06')).to.equal(1454889600000);
    });

    it('day', () => {
      expect(periodToTimestamp('20160229')).to.equal(1456704000000);
    });
  });

  describe('getCurrentPeriod', () => {
    const assertCorrectMethodInvocations = (periodType, format) => {
      const formatMethodStub = sinon.stub();
      const momentStub = sinon.stub(moment, 'utc').returns({
        format: formatMethodStub,
      });

      getCurrentPeriod(periodType);
      expect(momentStub).to.have.been.calledOnceWithExactly();
      expect(formatMethodStub).to.have.been.calledOnceWith(format);
    };

    afterEach(() => {
      moment.utc.restore();
    });

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
      expect(periodToDisplayString('2019', YEAR)).to.equal('2019');
      expect(periodToDisplayString('201912', YEAR)).to.equal('2019');
      expect(periodToDisplayString('2019W12', YEAR)).to.equal('2019');
      expect(periodToDisplayString('20191202', YEAR)).to.equal('2019');
      expect(periodToDisplayString('2019Q3', YEAR)).to.equal('2019');
    });

    it('quarter', () => {
      expect(periodToDisplayString('2019', QUARTER)).to.equal('Q1 2019');
      expect(periodToDisplayString('201912', QUARTER)).to.equal('Q4 2019');
      expect(periodToDisplayString('2019W49', QUARTER)).to.equal('Q4 2019');
      expect(periodToDisplayString('20191202', QUARTER)).to.equal('Q4 2019');
      expect(periodToDisplayString('2019Q3', QUARTER)).to.equal('Q3 2019');
    });

    it('month', () => {
      expect(periodToDisplayString('2019', MONTH)).to.equal('Jan 2019');
      expect(periodToDisplayString('201912', MONTH)).to.equal('Dec 2019');
      expect(periodToDisplayString('2019W49', MONTH)).to.equal('Dec 2019');
      expect(periodToDisplayString('20191202', MONTH)).to.equal('Dec 2019');
      expect(periodToDisplayString('2019Q3', MONTH)).to.equal('Jul 2019');
    });

    it('week', () => {
      expect(periodToDisplayString('2019', WEEK)).to.equal('1st Jan 2019');
      expect(periodToDisplayString('201912', WEEK)).to.equal('1st Dec 2019');
      expect(periodToDisplayString('2019W49', WEEK)).to.equal('2nd Dec 2019');
      expect(periodToDisplayString('20191202', WEEK)).to.equal('2nd Dec 2019');
      expect(periodToDisplayString('2019Q3', WEEK)).to.equal('1st Jul 2019');
    });

    it('day', () => {
      expect(periodToDisplayString('2019', DAY)).to.equal('1st Jan 2019');
      expect(periodToDisplayString('201912', DAY)).to.equal('1st Dec 2019');
      expect(periodToDisplayString('2019W48', DAY)).to.equal('25th Nov 2019');
      expect(periodToDisplayString('2019W49', DAY)).to.equal('2nd Dec 2019');
      expect(periodToDisplayString('20191202', DAY)).to.equal('2nd Dec 2019');
      expect(periodToDisplayString('2019Q3', DAY)).to.equal('1st Jul 2019');
    });

    it('should default to the period type of the input', () => {
      expect(periodToDisplayString('2019')).to.equal('2019');
      expect(periodToDisplayString('201912')).to.equal('Dec 2019');
      expect(periodToDisplayString('20191202')).to.equal('2nd Dec 2019');
      expect(periodToDisplayString('2019Q3')).to.equal('Q3 2019');
    });
  });

  describe('convertToPeriod', () => {
    it('should convert to end periods by default', () => {
      expect(convertToPeriod('2016', MONTH)).to.equal(convertToPeriod('2016', MONTH, true));
    });

    it('target type should be case insensitive', () => {
      expect(convertToPeriod('2016', MONTH)).to.equal(convertToPeriod('2016', 'month'));
      expect(convertToPeriod('2016', MONTH)).to.equal(convertToPeriod('2016', 'MONTH'));
      expect(convertToPeriod('2016', MONTH)).to.equal(convertToPeriod('2016', 'mOnTh'));
    });

    it('should throw an error if target type is not valid', () => {
      expect(() => convertToPeriod('2016', 'RANDOM')).to.throw('not a valid period type');
    });

    it('year', () => {
      expect(convertToPeriod('2016', YEAR, true)).to.equal('2016');
      expect(convertToPeriod('2016', YEAR, false)).to.equal('2016');
      expect(convertToPeriod('201602', YEAR, true)).to.equal('2016');
      expect(convertToPeriod('201602', YEAR, false)).to.equal('2016');
      expect(convertToPeriod('2016W10', YEAR, true)).to.equal('2016');
      expect(convertToPeriod('2016W10', YEAR, false)).to.equal('2016');
      expect(convertToPeriod('20160229', YEAR, true)).to.equal('2016');
      expect(convertToPeriod('20160229', YEAR, false)).to.equal('2016');
      expect(convertToPeriod('2016Q2', YEAR, true)).to.equal('2016');
      expect(convertToPeriod('2016Q2', YEAR, false)).to.equal('2016');
    });

    it('month', () => {
      expect(convertToPeriod('2016', MONTH, true)).to.equal('201612');
      expect(convertToPeriod('2016', MONTH, false)).to.equal('201601');
      expect(convertToPeriod('201602', MONTH, true)).to.equal('201602');
      expect(convertToPeriod('201602', MONTH, false)).to.equal('201602');
      expect(convertToPeriod('2016W09', MONTH, true)).to.equal('201603');
      expect(convertToPeriod('2016W09', MONTH, false)).to.equal('201602');
      expect(convertToPeriod('20160229', MONTH, true)).to.equal('201602');
      expect(convertToPeriod('20160229', MONTH, false)).to.equal('201602');
      expect(convertToPeriod('2016Q2', MONTH, true)).to.equal('201606');
      expect(convertToPeriod('2016Q2', MONTH, false)).to.equal('201604');
    });

    it('week', () => {
      expect(convertToPeriod('2016', WEEK, true)).to.equal('2016W52');
      expect(convertToPeriod('2016', WEEK, false)).to.equal('2015W53');
      expect(convertToPeriod('201602', WEEK, true)).to.equal('2016W09');
      expect(convertToPeriod('201602', WEEK, false)).to.equal('2016W05');
      expect(convertToPeriod('2016W10', WEEK, true)).to.equal('2016W10');
      expect(convertToPeriod('2016W10', WEEK, false)).to.equal('2016W10');
      expect(convertToPeriod('20160229', WEEK, true)).to.equal('2016W09');
      expect(convertToPeriod('20160229', WEEK, false)).to.equal('2016W09');
      expect(convertToPeriod('201606', WEEK, true)).to.equal('2016W26');
      expect(convertToPeriod('2016Q2', WEEK, true)).to.equal('2016W26');
      expect(convertToPeriod('2016Q2', WEEK, false)).to.equal('2016W13');
    });

    it('day', () => {
      expect(convertToPeriod('2016', DAY, true)).to.equal('20161231');
      expect(convertToPeriod('2016', DAY, false)).to.equal('20160101');
      expect(convertToPeriod('201602', DAY, true)).to.equal('20160229');
      expect(convertToPeriod('201602', DAY, false)).to.equal('20160201');
      expect(convertToPeriod('2016W09', DAY, true)).to.equal('20160306');
      expect(convertToPeriod('2016W09', DAY, false)).to.equal('20160229');
      expect(convertToPeriod('20160229', DAY, true)).to.equal('20160229');
      expect(convertToPeriod('20160229', DAY, false)).to.equal('20160229');
      expect(convertToPeriod('201606', DAY, true)).to.equal('20160630');
      expect(convertToPeriod('2016Q2', DAY, true)).to.equal('20160630');
      expect(convertToPeriod('2016Q2', DAY, false)).to.equal('20160401');
    });
  });

  describe('findCoarsestPeriodType', () => {
    it('should return undefined if the input is empty', () => {
      expect(findCoarsestPeriodType([])).to.equal(undefined);
    });

    it('should return undefined if no valid period type exists in the input', () => {
      expect(findCoarsestPeriodType(['RANDOM', 'INPUT'])).to.equal(undefined);
    });

    it('should work with invalid period types in the input', () => {
      expect(findCoarsestPeriodType([DAY, undefined, MONTH, 'RANDOM', DAY])).to.equal(MONTH);
    });

    it('should detect an annual period', () => {
      expect(findCoarsestPeriodType([YEAR])).to.equal(YEAR);
      expect(findCoarsestPeriodType([DAY, YEAR, WEEK, QUARTER, MONTH, DAY, MONTH])).to.equal(YEAR);
    });

    it('should detect a quarterly period', () => {
      expect(findCoarsestPeriodType([QUARTER])).to.equal(QUARTER);
      expect(findCoarsestPeriodType([DAY, DAY, QUARTER, MONTH])).to.equal(QUARTER);
    });

    it('should detect a monthly period', () => {
      expect(findCoarsestPeriodType([MONTH])).to.equal(MONTH);
      expect(findCoarsestPeriodType([DAY, MONTH, WEEK, DAY])).to.equal(MONTH);
    });

    it('should detect a weekly period', () => {
      expect(findCoarsestPeriodType([WEEK])).to.equal(WEEK);
      expect(findCoarsestPeriodType([DAY, WEEK, DAY])).to.equal(WEEK);
    });

    it('should detect a daily period', () => {
      expect(findCoarsestPeriodType([DAY])).to.equal(DAY);
      expect(findCoarsestPeriodType([DAY, DAY])).to.equal(DAY);
    });
  });

  describe('isCoarserPeriod', () => {
    it('should return false if either of the periods are not valid', () => {
      expect(isCoarserPeriod('2012')).to.equal(false);
      expect(isCoarserPeriod()).to.equal(false);
      expect(isCoarserPeriod('NOT_A_PERIOD', '2016W22')).to.equal(false);
      expect(isCoarserPeriod('2016Q1', 'NOT_A_PERIOD')).to.equal(false);
      expect(isCoarserPeriod('NOT_A_PERIOD', 'NEITHER_IS_THIS')).to.equal(false);
    });
    it('should detect if the first period is more coarse', () => {
      expect(isCoarserPeriod('2016', '2016Q2')).to.equal(true);
      expect(isCoarserPeriod('201605', '2016Q2')).to.equal(false);
      expect(isCoarserPeriod('2016W08', '20101010')).to.equal(true);
      expect(isCoarserPeriod('2016Q2', '2013W02')).to.equal(true);
      expect(isCoarserPeriod('20160502', '2010')).to.equal(false);
    });
    it('should return false if the period types are the same', () => {
      expect(isCoarserPeriod('2012', '2016')).to.equal(false);
      expect(isCoarserPeriod('201405', '201601')).to.equal(false);
      expect(isCoarserPeriod('2016W08', '2016W22')).to.equal(false);
      expect(isCoarserPeriod('2016Q1', '2016Q2')).to.equal(false);
      expect(isCoarserPeriod('20160505', '20111202')).to.equal(false);
    });
  });

  describe('getPeriodsInRange', () => {
    it('should throw an error if the start period is later than the end period', () => {
      expect(() => getPeriodsInRange('20160115', '20160114')).to.throw(
        'must be earlier than or equal',
      );
    });

    it('should throw an error for periods of different types and no target type specified', () => {
      expect(() => getPeriodsInRange('2016', '201602')).to.throw('different period types');
    });

    it('should default to the period type of the inputs if no target type specified', () => {
      expect(getPeriodsInRange('2016', '2017')).to.deep.equal(
        getPeriodsInRange('2016', '2017', YEAR),
      );
      expect(getPeriodsInRange('2016Q1', '2017Q4')).to.deep.equal(
        getPeriodsInRange('2016Q1', '2017Q4', QUARTER),
      );
      expect(getPeriodsInRange('201601', '201603')).to.deep.equal(
        getPeriodsInRange('201601', '201603', MONTH),
      );
      expect(getPeriodsInRange('2016W01', '2016W03')).to.deep.equal(
        getPeriodsInRange('2016W01', '2016W03', WEEK),
      );
      expect(getPeriodsInRange('20160301', '20160305')).to.deep.equal(
        getPeriodsInRange('20160301', '20160305', DAY),
      );
    });

    it('should handle inputs of mixed types when target type is specified', () => {
      expect(getPeriodsInRange('201603', '20180403', YEAR)).to.deep.equal(
        getPeriodsInRange('2016', '2018', YEAR),
      );
      expect(getPeriodsInRange('2016', '201804', QUARTER)).to.deep.equal(
        getPeriodsInRange('2016Q1', '2018Q2', QUARTER),
      );
      expect(getPeriodsInRange('2016', '20180403', MONTH)).to.deep.equal(
        getPeriodsInRange('201601', '201804', MONTH),
      );
      expect(getPeriodsInRange('2016', '20180403', WEEK)).to.deep.equal(
        getPeriodsInRange('2015W53', '2018W14', WEEK),
      );
      expect(getPeriodsInRange('2016', '201804', DAY)).to.deep.equal(
        getPeriodsInRange('20160101', '20180430', DAY),
      );
    });

    it('should return an array with a single item if period limits are identical', () => {
      expect(getPeriodsInRange('2016', '2016')).to.deep.equal(['2016']);
    });

    describe('year', () => {
      it('should return the years in range', () => {
        expect(getPeriodsInRange('2016', '2018', YEAR)).to.deep.equal(['2016', '2017', '2018']);
        expect(getPeriodsInRange('2016Q1', '2018Q4', YEAR)).to.deep.equal(['2016', '2017', '2018']);
        expect(getPeriodsInRange('2016Q4', '2018Q1', YEAR)).to.deep.equal(['2016', '2017', '2018']);
        expect(getPeriodsInRange('201612', '201801', YEAR)).to.deep.equal(['2016', '2017', '2018']);
        expect(getPeriodsInRange('2016W52', '2018W01', YEAR)).to.deep.equal([
          '2016',
          '2017',
          '2018',
        ]);
        expect(getPeriodsInRange('20161231', '20180101', YEAR)).to.deep.equal([
          '2016',
          '2017',
          '2018',
        ]);
      });
    });

    describe('quarter', () => {
      it('should return the quarters in range', () => {
        expect(getPeriodsInRange('2016', '2017', QUARTER)).to.deep.equal([
          '2016Q1',
          '2016Q2',
          '2016Q3',
          '2016Q4',
          '2017Q1',
          '2017Q2',
          '2017Q3',
          '2017Q4',
        ]);
        expect(getPeriodsInRange('2016Q1', '2016Q3', QUARTER)).to.deep.equal([
          '2016Q1',
          '2016Q2',
          '2016Q3',
        ]);
        expect(getPeriodsInRange('201612', '201701', QUARTER)).to.deep.equal(['2016Q4', '2017Q1']);
        expect(getPeriodsInRange('2016W52', '2017W15', QUARTER)).to.deep.equal([
          '2016Q4',
          '2017Q1',
          '2017Q2',
        ]);
        expect(getPeriodsInRange('20161231', '20170401', QUARTER)).to.deep.equal([
          '2016Q4',
          '2017Q1',
          '2017Q2',
        ]);
      });
    });

    describe('month', () => {
      it('should return the months in range', () => {
        expect(getPeriodsInRange('2016', '2017', MONTH)).to.deep.equal([
          ...getMonthPeriodsInYear('2016'),
          ...getMonthPeriodsInYear('2017'),
        ]);
        expect(getPeriodsInRange('2016Q3', '2016Q4', MONTH)).to.deep.equal([
          '201607',
          '201608',
          '201609',
          '201610',
          '201611',
          '201612',
        ]);
        expect(getPeriodsInRange('201601', '201603', MONTH)).to.deep.equal([
          '201601',
          '201602',
          '201603',
        ]);
        expect(getPeriodsInRange('2016W01', '2016W09', MONTH)).to.deep.equal([
          '201601',
          '201602',
          '201603',
        ]);
        expect(getPeriodsInRange('20160112', '20160304', MONTH)).to.deep.equal([
          '201601',
          '201602',
          '201603',
        ]);
      });

      it('should handle crossing year boundary', () => {
        expect(getPeriodsInRange('201612', '201701', MONTH)).to.deep.equal(['201612', '201701']);
        expect(getPeriodsInRange('201611', '201702', MONTH)).to.deep.equal([
          '201611',
          '201612',
          '201701',
          '201702',
        ]);
      });

      it('should handle crossing year boundary with quarters', () => {
        expect(getPeriodsInRange('2016Q4', '2017Q1', MONTH)).to.deep.equal([
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
        expect(getPeriodsInRange('2016', '2017', WEEK)).to.deep.equal([
          '2015W53',
          ...createWeekPeriods('2016', 1, 52),
          ...createWeekPeriods('2017', 1, 52),
        ]);
        expect(getPeriodsInRange('201601', '201603', WEEK)).to.deep.equal([
          '2015W53',
          ...createWeekPeriods('2016', 1, 13),
        ]);
        expect(getPeriodsInRange('2016W01', '2016W14', WEEK)).to.deep.equal(
          createWeekPeriods('2016', 1, 14),
        );
        expect(getPeriodsInRange('20160111', '20160117', WEEK)).to.deep.equal(['2016W02']);
        expect(getPeriodsInRange('20160110', '20160116', WEEK)).to.deep.equal([
          '2016W01',
          '2016W02',
        ]);
      });

      it('should handle crossing year boundary', () => {
        expect(getPeriodsInRange('20151227', '20160101', WEEK)).to.deep.equal([
          '2015W52',
          '2015W53',
        ]);
        expect(getPeriodsInRange('20161231', '20170102', WEEK)).to.deep.equal([
          '2016W52',
          '2017W01',
        ]);
      });
    });

    describe('day', () => {
      it('should return the days in range', () => {
        expect(getPeriodsInRange('20160101', '20160103', DAY)).to.deep.equal([
          '20160101',
          '20160102',
          '20160103',
        ]);
        expect(getPeriodsInRange('201601', '201601', DAY)).to.deep.equal(
          getDayPeriodsInMonth('201601', 31),
        );
      });

      it('should handle crossing year boundary', () => {
        expect(getPeriodsInRange('20161231', '20170101', DAY)).to.deep.equal([
          '20161231',
          '20170101',
        ]);
        expect(getPeriodsInRange('20161230', '20170102', DAY)).to.deep.equal([
          '20161230',
          '20161231',
          '20170101',
          '20170102',
        ]);
      });

      it('should handle crossing month boundary', () => {
        expect(getPeriodsInRange('20160731', '20160801', DAY)).to.deep.equal([
          '20160731',
          '20160801',
        ]);
        expect(getPeriodsInRange('20160730', '20160802', DAY)).to.deep.equal([
          '20160730',
          '20160731',
          '20160801',
          '20160802',
        ]);
      });

      it('should handle February days in a non leap year', () => {
        expect(getPeriodsInRange('20170227', '20170301')).to.deep.equal([
          '20170227',
          '20170228',
          '20170301',
        ]);
      });

      it('should handle February days in a leap year', () => {
        expect(getPeriodsInRange('20160227', '20160301')).to.deep.equal([
          '20160227',
          '20160228',
          '20160229',
          '20160301',
        ]);
      });
    });
  });
});
