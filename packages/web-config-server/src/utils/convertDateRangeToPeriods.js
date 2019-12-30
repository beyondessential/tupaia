import { PERIOD_TYPES, getPeriodsInRange, momentToPeriod } from '/dhis/periodTypes';
import { utcMoment } from './utcMoment';

const { DAY, MONTH } = PERIOD_TYPES;

export const GRANULARITY = {
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
  SINGLE_WEEK: 'one_week_at_a_time',
  SINGLE_MONTH: 'one_month_at_a_time',
  SINGLE_YEAR: 'one_year_at_a_time',
};

const getDateData = date => {
  const moment = utcMoment(date);

  return {
    moment,
    dayPeriod: momentToPeriod(moment, DAY),
    monthPeriod: momentToPeriod(moment, MONTH),
    day: moment.date(),
  };
};

/**
 * Returns the periods between the provided dates. A combination of day and month periods is used,
 * preferring months over days if they can summarize part of the result range. E.g.
 * * (201801, 201803) => [201801, 201802, 201803]
 * * (20180103, 20180106) => [20180103, 20180104, 20180105, 20180106]
 * * (20180101, 20180228) => [201801, 201802]
 *
 * @param {Moment|string} startDate
 * @param {Moment|string} endDate
 * @returns {string[]}
 */
export const convertDateRangeToPeriods = (startDate, endDate) => {
  const start = getDateData(startDate);
  const end = getDateData(endDate);
  const monthsInRange = getPeriodsInRange(start.monthPeriod, end.monthPeriod);
  const lastDayOfEndMonth = end.moment.endOf('month').date();

  // Single month period
  if (monthsInRange.length === 1) {
    if (start.day === 1 && end.day === lastDayOfEndMonth) {
      return monthsInRange;
    }
    return getPeriodsInRange(start.dayPeriod, end.dayPeriod);
  }

  const result = monthsInRange;
  if (start.day > 1) {
    const beginningDays = getPeriodsInRange(start.dayPeriod, start.monthPeriod, DAY);
    result.shift(); // Remove first (partial)  month, to be replaced by day level period strings
    result.unshift(...beginningDays);
  }
  if (end.day < lastDayOfEndMonth) {
    const endDays = getPeriodsInRange(end.monthPeriod, end.dayPeriod, DAY);
    result.pop(); // Remove final (partial) month, to be replaced by day level period strings
    result.push(...endDays);
  }

  return result;
};
