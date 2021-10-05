/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import MockDate from 'mockdate';
import moment from 'moment';

import { utcMoment } from '../../../datetime';

import {
  dateStringToPeriod,
  findCoarsestPeriodType,
  getCurrentPeriod,
  getOffsetMoment,
  isCoarserPeriod,
  isFuturePeriod,
  isValidPeriod,
  momentToPeriod,
  parsePeriodType,
  PERIOD_TYPES,
  periodToDateString,
  periodToTimestamp,
  periodToType,
} from '../../../period/period';
import { testConvertToPeriod } from './testConvertToPeriod';
import { testGetPeriodsInRange } from './testGetPeriodsInRange';
import { testPeriodToDisplayString } from './testPeriodToDisplayString';
import { testComparePeriods } from './testComparePeriods';

const { DAY, WEEK, MONTH, QUARTER, YEAR } = PERIOD_TYPES;

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

  describe('comparePeriods', testComparePeriods);

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

  describe('periodToDateString', () => {
    it('uses start period by default', () => {
      expect(periodToDateString('2020')).toBe(periodToDateString('2020', false));
    });

    describe('start periods', () => {
      const testData = [
        ['year', '2020', '2020-01-01'],
        ['quarter', '2020Q2', '2020-04-01'],
        ['month', '202002', '2020-02-01'],
        ['week', '2020W01', '2019-12-30'],
        ['day', '20200131', '2020-01-31'],
      ];

      it.each(testData)('%s', (_, period, expected) => {
        expect(periodToDateString(period, false)).toBe(expected);
      });
    });

    describe('end periods', () => {
      const testData = [
        ['year', '2020', '2020-12-31'],
        ['quarter', '2020Q2', '2020-06-30'],
        ['month', '202002', '2020-02-29'],
        ['week', '2020W01', '2020-01-05'],
        ['day', '20200131', '2020-01-31'],
      ];

      it.each(testData)('%s', (_, period, expected) => {
        expect(periodToDateString(period, true)).toBe(expected);
      });
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

  describe('periodToDisplayString', testPeriodToDisplayString);

  describe('convertToPeriod', testConvertToPeriod);

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

  describe('getPeriodsInRange', testGetPeriodsInRange);

  describe('getOffsetMoment', () => {
    const currentDateStub = '2020-12-27';

    beforeEach(() => {
      MockDate.set(currentDateStub);
    });

    afterEach(() => {
      MockDate.reset();
    });

    const testData = [
      // date
      ['empty date - uses today', [undefined, {}], '2020-12-27'],
      // unit, offset
      ['unit is empty - uses input date', ['2019-06-07', {}], '2019-06-07'],
      ['unit is invalid - uses input date', ['2019-06-07', { unit: 'invalid' }], '2019-06-07'],
      ['unit: year,    + offset', ['2019-06-07', { offset: +2, unit: 'YEAR' }], '2021-06-07'],
      ['unit: year,    - offset', ['2019-06-07', { offset: -2, unit: 'YEAR' }], '2017-06-07'],
      ['unit: quarter, + offset', ['2019-06-07', { offset: +2, unit: 'QUARTER' }], '2019-12-07'],
      ['unit: quarter, - offset', ['2019-06-07', { offset: -2, unit: 'QUARTER' }], '2018-12-07'],
      ['unit: month,   + offset', ['2019-06-07', { offset: +2, unit: 'MONTH' }], '2019-08-07'],
      ['unit: month,   - offset', ['2019-06-07', { offset: -2, unit: 'MONTH' }], '2019-04-07'],
      ['unit: week,    + offset', ['2019-06-07', { offset: +2, unit: 'WEEK' }], '2019-06-21'],
      ['unit: week,    - offset', ['2019-06-07', { offset: -2, unit: 'WEEK' }], '2019-05-24'],
      ['unit: day,     + offset', ['2019-06-07', { offset: +2, unit: 'DAY' }], '2019-06-09'],
      ['unit: day,     - offset', ['2019-06-07', { offset: -2, unit: 'DAY' }], '2019-06-05'],
      [
        'unit is lowercase - converts to uppercase',
        ['2019-06-07', { offset: +2, unit: 'year' }],
        '2021-06-07',
      ],
      // modifier, modifierUnit
      [
        'modifier is empty - does not modify date',
        ['2019-06-07', { unit: 'year', modifierUnit: 'month' }],
        '2019-06-07',
      ],
      [
        'modifier is invalid - does not modify date',
        ['2019-06-07', { unit: 'year', modifier: 'invalid', modifierUnit: 'month' }],
        '2019-06-07',
      ],
      [
        'modifier: start_of',
        ['2019-06-07', { unit: 'year', offset: -2, modifier: 'start_of', modifierUnit: 'year' }],
        '2017-01-01T00:00:00Z',
      ],
      [
        'modifier: end_of',
        ['2019-06-07', { unit: 'year', offset: +2, modifier: 'end_of', modifierUnit: 'year' }],
        '2021-12-31T23:59:59Z',
      ],
      [
        'modifier is valid, modifierUnit is empty - uses unit',
        ['2019-06-07', { unit: 'year', offset: +2, modifier: 'end_of' }],
        '2021-12-31T23:59:59Z',
      ],
      [
        'modifier is valid, modifierUnit is not empty - uses modifierUnit',
        ['2019-06-07', { unit: 'year', offset: +2, modifier: 'end_of', modifierUnit: 'month' }],
        '2021-06-30T23:59:59Z',
      ],
      [
        'modifier is valid, offset is empty - does not apply offset',
        ['2019-06-07', { unit: 'year', modifier: 'end_of', modifierUnit: 'year' }],
        '2019-12-31T23:59:59Z',
      ],
    ];

    it.each(testData)('%s', (_, [date, dateOffset], expected) => {
      const received = getOffsetMoment(date, dateOffset);
      expect(received.format()).toBe(utcMoment(expected).format());
    });
  });
});
