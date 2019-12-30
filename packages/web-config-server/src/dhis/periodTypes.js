/**
 * Tupaia Config Server
 * * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import get from 'lodash.get';

import { utcMoment } from '/utils';
import { reduceToDictionary } from '/utils/object';

const DAY = 'DAY';
const WEEK = 'WEEK';
const MONTH = 'MONTH';
const YEAR = 'YEAR';

/**
 * Available period formats for aggregation server data
 */
export const PERIOD_TYPES = {
  DAY, // e.g. '20180104'
  WEEK, // e.g. '2018W01'
  MONTH, // e.g. '201801'
  YEAR, // e.g. '2018'
};

const PERIOD_TYPE_CONFIG = {
  [DAY]: {
    format: 'YYYYMMDD',
    length: 8,
    displayFormat: 'Do MMM YYYY',
    momentShorthand: 'd',
    momentUnit: 'day',
  },
  [WEEK]: {
    format: 'GGGG[W]WW',
    length: 7,
    displayFormat: 'Do MMM YYYY',
    momentShorthand: 'w',
    momentUnit: 'isoWeek',
  },
  [MONTH]: {
    format: 'YYYYMM',
    length: 6,
    displayFormat: 'MMM YYYY',
    momentShorthand: 'M',
    momentUnit: 'month',
  },
  [YEAR]: {
    format: 'YYYY',
    length: 4,
    displayFormat: 'YYYY',
    momentShorthand: 'Y',
    momentUnit: 'year',
  },
};

const LENGTH_TO_PERIOD_TYPE = reduceToDictionary(
  Object.entries(PERIOD_TYPE_CONFIG).map(([periodType, { length }]) => ({
    length,
    periodType,
  })),
  'length',
  'periodType',
);

const createAccessor = field => periodType => get(PERIOD_TYPE_CONFIG, [periodType, field]);
const toFormat = createAccessor('format');
const toLength = createAccessor('length');
const toDisplayFormat = createAccessor('displayFormat');
const toMomentShorthand = createAccessor('momentShorthand');
const toMomentUnit = createAccessor('momentUnit');

export const getPeriodType = (period = '') => LENGTH_TO_PERIOD_TYPE[period.length];

export const parsePeriodType = periodTypeString => {
  const error = new Error(`Period type must be one of ${PERIOD_TYPES}`);

  if (!(typeof periodTypeString === 'string')) {
    throw error;
  }
  const periodType = PERIOD_TYPES[periodTypeString.toUpperCase()];
  if (!Object.values(PERIOD_TYPES).includes(periodType)) {
    throw error;
  }

  return periodType;
};

const periodToMoment = period => {
  const periodType = getPeriodType(period);
  return utcMoment(period, toFormat(periodType));
};

export const momentToPeriod = (moment, periodType) => moment.format(toFormat(periodType));

export const periodToTimestamp = period => periodToMoment(period).valueOf();

export const getCurrentPeriod = periodType => utcMoment().format(toFormat(periodType));

export const periodToDisplayString = (period, targetType) => {
  const formattedPeriodType = targetType || getPeriodType(period);
  return periodToMoment(period).format(toDisplayFormat(formattedPeriodType));
};

/**
 * @param {string} period A DHIS data period
 * @param {string} targetType Type of DHIS period to convert to
 * @param {boolean} isEndPeriod if set, the periods will be converted
 * to the last available period of their initial range
 * @returns {string}
 */
export const convertToPeriod = (period, targetType, isEndPeriod = true) => {
  const sanitizedTargetType = targetType.toUpperCase();
  // Week periods are a special case because they use different format logic
  return sanitizedTargetType === WEEK
    ? convertToWeekPeriod(period, isEndPeriod)
    : convertToNonWeekPeriod(period, sanitizedTargetType, isEndPeriod);
};

const convertToWeekPeriod = (period, isEndPeriod) => {
  const moment = periodToMoment(period);
  const inputType = getPeriodType(period);
  if (isEndPeriod) {
    moment.endOf(toMomentUnit(inputType));
  } else {
    moment.startOf(toMomentUnit(inputType));
  }

  return moment.format(toFormat(WEEK));
};

/**
 * Note: this method uses low-level string manipulation instead of `moment.js`
 * This decision was based on performance, since the `moment.js` implementation
 * was around 30 times slower than the one below
 */
const convertToNonWeekPeriod = (period, targetType, isEndPeriod) => {
  let result = period;
  if (getPeriodType(period) === WEEK) {
    result = periodToMoment(result);
    result = isEndPeriod ? result.endOf(toMomentUnit(WEEK)) : result.startOf(toMomentUnit(WEEK));
    result = result.format(toFormat(DAY));
  }
  // Remove unnecessary characters at the end of the period string
  result = result.substring(0, toLength(targetType));

  const inputType = getPeriodType(result);

  switch (targetType) {
    case DAY: {
      if (inputType === YEAR) {
        result += isEndPeriod ? '1231' : '0101';
      } else if (inputType === MONTH) {
        result += isEndPeriod
          ? periodToMoment(period)
              .endOf(toMomentUnit(MONTH))
              .date()
          : '01';
      }
      break;
    }
    case MONTH:
      if (inputType === YEAR) {
        result += isEndPeriod ? '12' : '01';
      }
      break;
    case YEAR:
      break;
    default:
      throw new Error(`'${targetType}' is not a valid period type`);
  }

  return result;
};

/**
 * @param {string[]} periodTypes
 * @returns {string}
 */
export const findCoarsestPeriodType = periodTypes => {
  let minLength;
  let result;

  periodTypes.forEach(periodType => {
    const currentLength = toLength(periodType);
    if (!currentLength) {
      return;
    }

    if (currentLength < minLength || minLength === undefined) {
      minLength = currentLength;
      result = periodType;
    }
  });

  return result;
};

/**
 * Returns all DHIS2 periods in a specified range (inclusive)
 *
 * @param {string} start The start period. Must be earlier than or equal to the end period
 * @param {string} end The end period
 * @param {string} targetType If provided, periods will be converted to this type.
 * If not, the period type will be detected by the provided periods
 * @returns {string[]}
 */
export const getPeriodsInRange = (start, end, targetType) => {
  let periodType;
  let startPeriod;
  let endPeriod;

  if (targetType) {
    periodType = targetType;
    startPeriod = convertToPeriod(start, targetType, false);
    endPeriod = convertToPeriod(end, targetType);
  } else {
    periodType = getPeriodType(start);
    if (getPeriodType(end) !== periodType) {
      throw new Error('Start and end periods are of different period types');
    }

    startPeriod = start;
    endPeriod = end;
  }

  if (startPeriod > endPeriod) {
    throw new Error('Start period must be earlier than or equal to the end period');
  }

  const periodsInRange = [];
  // Prefer moment mutation to creation for performance reasons
  const mutatingMoment = periodToMoment(startPeriod);
  let currentPeriod = startPeriod;
  while (currentPeriod <= endPeriod) {
    periodsInRange.push(currentPeriod);
    mutatingMoment.add(1, toMomentShorthand(periodType));
    currentPeriod = momentToPeriod(mutatingMoment, periodType);
  }

  return periodsInRange;
};
