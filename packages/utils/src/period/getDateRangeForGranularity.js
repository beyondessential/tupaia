import memoize from 'fast-memoize';
import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = `${DATE_FORMAT} HH:mm:ss`;

const PERIOD_GRANULARITIES = {
  YEARLY: 'yearly',
  QUARTERLY: 'quarterly',
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  DAILY: 'daily',
};

const PERIOD_GRANULARITY_TO_MOMENT_UNIT = {
  [PERIOD_GRANULARITIES.YEARLY]: 'year',
  [PERIOD_GRANULARITIES.QUARTERLY]: 'quarter',
  [PERIOD_GRANULARITIES.MONTHLY]: 'month',
  [PERIOD_GRANULARITIES.WEEKLY]: 'isoWeek',
  [PERIOD_GRANULARITIES.DAILY]: 'day',
};

/**
 * @param {Date|string} date
 * @returns {string}
 */
const extractDateString = date => {
  const datetimeString = typeof date === 'string' ? date : date.toISOString();
  return datetimeString.substring(0, DATE_FORMAT.length);
};

export const getDateRangeForGranularity = memoize(
  (datetime, periodGranularity) => {
    const momentUnit = PERIOD_GRANULARITY_TO_MOMENT_UNIT[periodGranularity];

    return {
      startDate: moment(datetime).startOf(momentUnit).format(DATETIME_FORMAT),
      endDate: moment(datetime).endOf(momentUnit).format(DATETIME_FORMAT),
    };
  },
  {
    serializer: args => {
      const [periodGranularity, date] = args;
      // Date may include a time part. None of the existing granularities depends on time,
      // so we can remote it for effective caching
      const dateString = extractDateString(date);
      return JSON.stringify({ periodGranularity, date: dateString });
    },
  },
);
