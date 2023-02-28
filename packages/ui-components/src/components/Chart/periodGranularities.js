/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import moment from 'moment';

import { addMomentOffset } from '@tupaia/utils';
import { WEEK_DISPLAY_CONFIG, WEEK_DISPLAY_FORMATS } from './weekDisplayFormats';

export const DEFAULT_MIN_DATE = '20150101';

const DAY = 'day';
const SINGLE_DAY = 'one_day_at_a_time';
const WEEK = 'week';
const SINGLE_WEEK = 'one_week_at_a_time';
const MONTH = 'month';
const SINGLE_MONTH = 'one_month_at_a_time';
const QUARTER = 'quarter';
const SINGLE_QUARTER = 'one_quarter_at_a_time';
const YEAR = 'year';
const SINGLE_YEAR = 'one_year_at_a_time';

const CONFIG = {
  [DAY]: {
    chartFormat: 'Do MMM YYYY',
    rangeFormat: 'Do MMM YYYY',
    pickerFormat: 'D',
    urlFormat: 'Do_MMM_YYYY',
    momentShorthand: 'd',
    momentUnit: 'day',
  },
  [WEEK]: {
    ...WEEK_DISPLAY_CONFIG[WEEK_DISPLAY_FORMATS.WEEK_COMMENCING_ABBR],
    momentShorthand: 'w',
    momentUnit: 'isoWeek',
  },
  [MONTH]: {
    chartFormat: 'MMM YYYY',
    rangeFormat: 'MMM YYYY',
    pickerFormat: 'MMMM',
    urlFormat: 'MMM_YYYY',
    momentShorthand: 'M',
    momentUnit: 'month',
  },
  [QUARTER]: {
    chartFormat: '[Q]Q YYYY',
    rangeFormat: '[Q]Q YYYY',
    pickerFormat: '[Q]Q',
    urlFormat: '[Q]Q_YYYY',
    momentShorthand: 'Q',
    momentUnit: 'quarter',
  },
  [YEAR]: {
    chartFormat: 'YYYY',
    rangeFormat: 'YYYY',
    pickerFormat: 'YYYY',
    urlFormat: 'YYYY',
    momentShorthand: 'Y',
    momentUnit: 'year',
  },
};

export const GRANULARITIES = {
  DAY,
  SINGLE_DAY,
  WEEK,
  SINGLE_WEEK,
  MONTH,
  SINGLE_MONTH,
  QUARTER,
  SINGLE_QUARTER,
  YEAR,
  SINGLE_YEAR,
};

export const GRANULARITY_CONFIG = {
  [DAY]: CONFIG[DAY],
  [SINGLE_DAY]: CONFIG[DAY],
  [WEEK]: CONFIG[WEEK],
  [SINGLE_WEEK]: CONFIG[WEEK],
  [MONTH]: CONFIG[MONTH],
  [SINGLE_MONTH]: CONFIG[MONTH],
  [QUARTER]: CONFIG[QUARTER],
  [SINGLE_QUARTER]: CONFIG[QUARTER],
  [YEAR]: CONFIG[YEAR],
  [SINGLE_YEAR]: CONFIG[YEAR],
};

export const GRANULARITIES_WITH_ONE_DATE = [
  SINGLE_DAY,
  SINGLE_WEEK,
  SINGLE_MONTH,
  SINGLE_QUARTER,
  SINGLE_YEAR,
];

export const GRANULARITIES_WITH_MULTIPLE_DATES = [DAY, WEEK, MONTH, QUARTER, YEAR];

export const GRANULARITY_SHAPE = PropTypes.oneOf([
  DAY,
  SINGLE_DAY,
  WEEK,
  SINGLE_WEEK,
  MONTH,
  SINGLE_MONTH,
  QUARTER,
  SINGLE_QUARTER,
  YEAR,
  SINGLE_YEAR,
]);

export const GRANULARITIES_WITH_ONE_DATE_VALID_OFFSET_UNIT = {
  [SINGLE_DAY]: DAY,
  [SINGLE_WEEK]: WEEK,
  [SINGLE_MONTH]: MONTH,
  [SINGLE_QUARTER]: QUARTER,
  [SINGLE_YEAR]: YEAR,
};

export const roundStartDate = (granularity, startDate) => {
  const { momentUnit } = GRANULARITY_CONFIG[granularity];
  const momentStartDate = moment.isMoment(startDate) ? startDate : moment(startDate);
  return momentStartDate.clone().startOf(momentUnit);
};

export const roundEndDate = (granularity, endDate) => {
  const { momentUnit } = GRANULARITY_CONFIG[granularity];
  const momentEndDate = moment.isMoment(endDate) ? endDate : moment(endDate);
  return momentEndDate.clone().endOf(momentUnit);
};

export const roundStartEndDates = (granularity, startDate, endDate) => ({
  startDate: roundStartDate(granularity, startDate),
  endDate: roundEndDate(granularity, endDate),
});

/**
 * @param date
 * @param granularity
 * @param format
 * @param {'startOfWeek' | 'endOfWeek' | undefined} modifier
 * @return {*}
 */
export const momentToDateString = (date, granularity, format, modifier) => {
  // Use the explicit modifier passed in, otherwise fall back to the default modifier of the granularity
  const mod = modifier ?? GRANULARITY_CONFIG[granularity].modifier ?? null;
  switch (mod) {
    case 'startOfWeek':
      return date.clone().startOf('W').format(format);
    case 'endOfWeek':
      return date.clone().endOf('W').format(format);
    default:
      return date.clone().format(format);
  }
};

/**
 * Get default dates for start and end period of single date period granularities,
 * meaning both start and end date will have the same date.
 * `defaultTimePeriod` can be in 2 ways:
 *
 * Short version:
 * {
 *    defaultTimePeriod: {offset: -1, unit: 'year'}
 * }
 *
 * Long version:
 * {
 *    defaultTimePeriod: {
 *        start: {unit: 'month', offset: -1},
 *        end: {unit: 'month', offset: -1}
 *    }
 * }
 * @param {*} periodGranularity
 * @param {*} defaultTimePeriod
 */
const getDefaultDatesForSingleDateGranularities = (periodGranularity, defaultTimePeriod) => {
  let startDate = moment();
  let endDate = startDate;

  if (defaultTimePeriod) {
    let singleDateConfig;

    // If defaultTimePeriod has either start or end,
    // pick either one of them because we only want a single date for both start and end period.
    // Eg: {defaultTimePeriod: {start: {unit: 'month', offset: -1}, end: {unit: 'month', offset: -1}}}
    if (defaultTimePeriod.start || defaultTimePeriod.end) {
      singleDateConfig = defaultTimePeriod.start || defaultTimePeriod.end;
    } else {
      // else, assume defaultTimePeriod is the period config. Eg: {defaultTimePeriod: {unit: 'month', offset: -1}}
      singleDateConfig = defaultTimePeriod;
    }

    const validDateOffsetUnit = GRANULARITIES_WITH_ONE_DATE_VALID_OFFSET_UNIT[periodGranularity];
    if (singleDateConfig.unit !== validDateOffsetUnit) {
      throw new Error(
        `defaultTimePeriod unit must match periodGranularity (periodGranularity: ${periodGranularity}, valid unit: ${validDateOffsetUnit}, given: ${singleDateConfig.unit})`,
      );
    }

    // Grab all the details and get a single default date used for both start/end period.
    startDate = addMomentOffset(startDate, singleDateConfig);
    endDate = startDate;
  }

  return roundStartEndDates(periodGranularity, startDate, endDate);
};

/**
 * Get default dates for start and end period of normal period granularities.
 * defaultTimePeriod has to have either start or end if you want to change the default start or end date.
 * Example:
 * {
 *    defaultTimePeriod: {
 *        start: {unit: 'year', offset: -3, modifier: 'start_of'},
 *        end: {unit: 'month', offset: -1, modifier: 'end_of'}
 *    }
 * }
 * @param {*} periodGranularity
 * @param {*} defaultTimePeriod
 */
const getDefaultDatesForRangeGranularities = (periodGranularity, defaultTimePeriod) => {
  if (defaultTimePeriod) {
    let startDate = moment();
    let endDate = startDate;

    if (defaultTimePeriod.start) {
      startDate = addMomentOffset(startDate, defaultTimePeriod.start);
    }
    if (defaultTimePeriod.end) {
      endDate = addMomentOffset(endDate, defaultTimePeriod.end);
    }

    return roundStartEndDates(periodGranularity, startDate, endDate);
  }

  return { startDate: moment(DEFAULT_MIN_DATE), endDate: moment() };
};

export function getDefaultDates(viewConfig) {
  const { periodGranularity, defaultTimePeriod } = viewConfig;

  // we need a valid granularity to proceed
  if (!periodGranularity) {
    return {};
  }

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(periodGranularity);
  if (isSingleDate) {
    return getDefaultDatesForSingleDateGranularities(periodGranularity, defaultTimePeriod);
  }
  return getDefaultDatesForRangeGranularities(periodGranularity, defaultTimePeriod);
}

export const getDefaultDrillDownDates = (drillDownViewConfig, previousStartDate) => {
  const { periodGranularity } = drillDownViewConfig;

  let defaultStartDate = null;
  let defaultEndDate = null;
  // If the second layer has periodGranularity set,
  // constrain the fetch by 1st layer date range
  if (periodGranularity) {
    defaultStartDate = previousStartDate;

    // set the endDate to be end of the startDate period
    const { momentUnit } = GRANULARITY_CONFIG[periodGranularity];
    defaultEndDate = moment(previousStartDate).clone().endOf(momentUnit);
  }

  return {
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  };
};

/**
 * @param {*} periodGranularity
 * @param {*} limits - same as defaultTimePeriod
 * @returns {{startDate, endDate}}
 */
export function getLimits(periodGranularity, limits) {
  if (!limits) {
    return { startDate: null, endDate: null };
  }

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(periodGranularity);

  let startDate = moment();
  let endDate = moment();

  for (const partKey of ['start', 'end']) {
    if (!limits[partKey]) continue;

    const partConfig = limits[partKey];

    let validDateOffsetUnit = periodGranularity;
    if (isSingleDate) {
      validDateOffsetUnit = GRANULARITIES_WITH_ONE_DATE_VALID_OFFSET_UNIT[periodGranularity];
    }

    if (partConfig.unit !== validDateOffsetUnit) {
      throw new Error(
        `limit unit must match periodGranularity (periodGranularity: ${periodGranularity}, valid unit: ${validDateOffsetUnit}, given: ${partConfig.unit})`,
      );
    }

    const offsetDate = addMomentOffset(moment(), partConfig);
    if (partKey === 'start') startDate = offsetDate;
    if (partKey === 'end') endDate = offsetDate;
  }

  return roundStartEndDates(periodGranularity, startDate, endDate);
}

/**
 * @param {Moment} date
 * @param {Moment} min
 * @param {Moment} max
 * @returns {Moment}
 */
export const constrainDate = (date, min, max) => {
  let d = date.clone();
  if (d < min) d = min;
  if (d > max) d = max;
  return d;
};

export const DATE_FORMAT = 'YYYY-MM-DD';

export const formatDateForApi = (date, timezone) => {
  if (!date) return undefined;
  const dateAsMoment = moment.isMoment(date) ? date : moment(date);
  if (timezone) dateAsMoment.tz(timezone);
  return dateAsMoment.format(DATE_FORMAT);
};

export const toStandardDateString = date => {
  if (!date) return undefined;
  const dateAsMoment = moment.isMoment(date) ? date : moment(date);
  return dateAsMoment.format(DATE_FORMAT);
};
