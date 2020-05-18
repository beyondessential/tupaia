/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';
import {
  PERIOD_TYPES,
  convertToPeriod,
  findCoarsestPeriodType,
  getCurrentPeriod,
  getPeriodsInRange,
  periodToType,
  dateStringToPeriod,
  momentToPeriod,
  periodToDisplayString,
  parsePeriodType,
  periodToTimestamp,
} from '../../period/period';

const { DAY, WEEK, MONTH, YEAR } = PERIOD_TYPES;

const MONTHS_IN_YEAR = 12;

const indexToString = index => `${index + 1}`.padStart(2, '0');

const getMonthPeriodsInYear = year =>
  [...new Array(MONTHS_IN_YEAR)].map((value, monthIndex) => `${year}${indexToString(monthIndex)}`);

const getDayPeriodsInMonth = (monthPeriod, dayCountForMonth) =>
  [...new Array(dayCountForMonth)].map(
    (value, dayIndex) => `${monthPeriod}${indexToString(dayIndex)}`,
  );

const createWeekPeriods = (year, startWeekIndex, endWeekIndex) => {
  const weeks = [];
  for (let i = startWeekIndex; i <= endWeekIndex; i++) {
    // indices are 1-based
    weeks.push(`${year}W${indexToString(i - 1)}`);
  }

  return weeks;
};

context('periodTypes', () => {
  describe('periodToType', () => {
    it('should return undefined for empty input', () => {
      expect(periodToType()).to.equal(undefined);
    });

    it('should return undefined for invalid input', () => {
      expect(periodToType('20165')).to.equal(undefined);
    });

    it('year', () => {
      expect(periodToType('2016')).to.equal(YEAR);
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

  describe('parsePeriodType', () => {
    it('should return the period type for a correct lower case string', () => {
      expect(parsePeriodType('year')).to.equal(YEAR);
      expect(parsePeriodType('month')).to.equal(MONTH);
      expect(parsePeriodType('week')).to.equal(WEEK);
      expect(parsePeriodType('day')).to.equal(DAY);
    });

    it('should return the period type for a correct upper case string', () => {
      expect(parsePeriodType('YEAR')).to.equal(YEAR);
      expect(parsePeriodType('MONTH')).to.equal(MONTH);
      expect(parsePeriodType('WEEK')).to.equal(WEEK);
      expect(parsePeriodType('DAY')).to.equal(DAY);
    });

    it('should throw an error for a wrong input', () => {
      const wrongValues = ['random', false, undefined, null, { MONTH: 'MONTH' }];
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
    });

    it('month', () => {
      expect(periodToDisplayString('2019', MONTH)).to.equal('Jan 2019');
      expect(periodToDisplayString('201912', MONTH)).to.equal('Dec 2019');
      expect(periodToDisplayString('2019W49', MONTH)).to.equal('Dec 2019');
      expect(periodToDisplayString('20191202', MONTH)).to.equal('Dec 2019');
    });

    it('week', () => {
      expect(periodToDisplayString('2019', WEEK)).to.equal('1st Jan 2019');
      expect(periodToDisplayString('201912', WEEK)).to.equal('1st Dec 2019');
      expect(periodToDisplayString('2019W49', WEEK)).to.equal('2nd Dec 2019');
      expect(periodToDisplayString('20191202', WEEK)).to.equal('2nd Dec 2019');
    });

    it('day', () => {
      expect(periodToDisplayString('2019', DAY)).to.equal('1st Jan 2019');
      expect(periodToDisplayString('201912', DAY)).to.equal('1st Dec 2019');
      expect(periodToDisplayString('2019W48', DAY)).to.equal('25th Nov 2019');
      expect(periodToDisplayString('2019W49', DAY)).to.equal('2nd Dec 2019');
      expect(periodToDisplayString('20191202', DAY)).to.equal('2nd Dec 2019');
    });

    it('should default to the period type of the input', () => {
      expect(periodToDisplayString('2019')).to.equal('2019');
      expect(periodToDisplayString('201912')).to.equal('Dec 2019');
      expect(periodToDisplayString('20191202')).to.equal('2nd Dec 2019');
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
    });
  });

  describe('findCoarsestPeriodType', () => {
    it('should return undefined if the input is empty', () => {
      expect(findCoarsestPeriodType([])).to.equal(undefined);
    });

    it('should return undefined if no valid period type exists in the input', () => {
      expect(findCoarsestPeriodType(['RANDOM', 'INPUT'])).to.equal(undefined);
    });

    it('should detect an annual period', () => {
      expect(findCoarsestPeriodType([YEAR])).to.equal(YEAR);
      expect(findCoarsestPeriodType([DAY, YEAR, WEEK, MONTH, DAY, MONTH])).to.equal(YEAR);
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

    describe('month', () => {
      it('should return the months in range', () => {
        expect(getPeriodsInRange('2016', '2017', MONTH)).to.deep.equal([
          ...getMonthPeriodsInYear('2016'),
          ...getMonthPeriodsInYear('2017'),
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
