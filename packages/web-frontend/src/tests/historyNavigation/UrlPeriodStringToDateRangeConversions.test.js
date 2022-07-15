import moment from 'moment';
import {
  convertUrlPeriodStringToDateRange,
  convertDateRangeToUrlPeriodString,
} from '../../historyNavigation/utils';

const SINGLE_PERIOD_STRING = '2nd_Jan_2020'; // = moment('2020-01-02').format('Do_MMM_YYYY');
const SINGLE_DATE_RANGE = {
  startDate: moment('2020-01-02'),
  endDate: moment('2020-01-02'),
};

const RANGE_PERIOD_STRING = '2nd_Jan_2020-10th_Jan_2020';

const RANGE_DATE_RANGE = {
  startDate: moment('2020-01-02').startOf('D'),
  endDate: moment('2020-01-10').endOf('D'),
};

const assertMomentDatesAreEqual = (moment1, moment2) => expect(moment1.isSame(moment2)).toBe(true);

describe('convertUrlPeriodStringToDateRange', () => {
  it('should decode strings with only one date', () => {
    const { startDate, endDate } = convertUrlPeriodStringToDateRange(
      SINGLE_PERIOD_STRING,
      'one_day_at_a_time',
    );
    const { startDate: expectedStartDate, endDate: expectedEndDate } = SINGLE_DATE_RANGE;
    assertMomentDatesAreEqual(startDate, expectedStartDate);
    assertMomentDatesAreEqual(endDate, expectedEndDate);
  });

  it('should decode strings with multiple dates', () => {
    const { startDate, endDate } = convertUrlPeriodStringToDateRange(RANGE_PERIOD_STRING, 'day');
    const { startDate: expectedStartDate, endDate: expectedEndDate } = RANGE_DATE_RANGE;
    assertMomentDatesAreEqual(startDate, expectedStartDate);
    assertMomentDatesAreEqual(endDate, expectedEndDate);
  });
});

// Date range => period string
describe('convertDateRangeToUrlPeriodString', () => {
  it('should return null if neither startDate nor endDate is defined', () => {
    expect(convertDateRangeToUrlPeriodString({}, 'day')).toBeNull();
  });

  it('should encode strings with only one date', () => {
    expect(convertDateRangeToUrlPeriodString(SINGLE_DATE_RANGE, 'one_day_at_a_time')).toEqual(
      SINGLE_PERIOD_STRING,
    );
  });

  it('should encode strings with multiple dates', () => {
    expect(convertDateRangeToUrlPeriodString(RANGE_DATE_RANGE, 'day')).toEqual(RANGE_PERIOD_STRING);
  });
});
