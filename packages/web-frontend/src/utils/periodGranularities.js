/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import moment from 'moment';

import { addMomentOffset } from '@tupaia/utils';

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
    chartFormat: 'D MMM YYYY',
    rangeFormat: '[W/C] D MMM YYYY',
    pickerFormat: '[W/C] D MMM YYYY',
    urlFormat: '[Week_Starting]_D_MMM_YYYY',
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

export function roundStartEndDates(granularity, startDate = moment(), endDate = moment()) {
  const { momentUnit } = GRANULARITY_CONFIG[granularity];
  return {
    startDate: startDate.clone().startOf(momentUnit),
    endDate: endDate.clone().endOf(momentUnit),
  };
}

export const momentToDateString = (date, granularity, format) =>
  granularity === WEEK || granularity === SINGLE_WEEK
    ? date.clone().startOf('W').format(format)
    : date.clone().format(format);

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
 *
 * Long version with date string instead of config object:
 * {
 *    defaultTimePeriod: {
 *        start: '2019-08-02'
 *    }
 * }
 *
 * @param {*} periodGranularity
 * @param {*} defaultTimePeriod
 */

const validateDateString = date => {
  if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
    throw new Error('Date string is not in the correct format');
  }
};

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
      if (typeof singleDateConfig === 'string') {
        validateDateString(singleDateConfig);
      }
    } else {
      // else, assume defaultTimePeriod is the period config. Eg: {defaultTimePeriod: {unit: 'month', offset: -1}}
      singleDateConfig = defaultTimePeriod;
    }

    const validDateOffsetUnit = GRANULARITIES_WITH_ONE_DATE_VALID_OFFSET_UNIT[periodGranularity];
    if (singleDateConfig.unit !== validDateOffsetUnit && typeof singleDateConfig !== 'string') {
      throw new Error(
        `defaultTimePeriod unit must match periodGranularity (periodGranularity: ${periodGranularity}, valid unit: ${validDateOffsetUnit}, given: ${singleDateConfig.unit})`,
      );
    }

    // Grab all the details and get a single default date used for both start/end period. If start or end is a string value, grab that directly.
    startDate =
      typeof singleDateConfig === 'string'
        ? moment(singleDateConfig)
        : addMomentOffset(moment(), singleDateConfig);
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
      startDate = addMomentOffset(moment(), defaultTimePeriod.start);
    }
    if (defaultTimePeriod.end) {
      endDate = addMomentOffset(moment(), defaultTimePeriod.end);
    }
    if (typeof defaultTimePeriod.start === 'string') {
      validateDateString(defaultTimePeriod.start);
      startDate = moment(defaultTimePeriod.start);
    }
    if (typeof defaultTimePeriod.end === 'string') {
      validateDateString(defaultTimePeriod.end);
      endDate = moment(defaultTimePeriod.end);
    }
    if (moment(startDate).isAfter(endDate)) {
      throw new Error(`Start date must be earlier than the end date`);
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

export const getDatesAsString = (isSingleDate, granularity, startDate, endDate) => {
  const DEFAULT_GRANULARITY = GRANULARITY_CONFIG[GRANULARITIES.DAY];
  const { rangeFormat } = GRANULARITY_CONFIG[granularity] || DEFAULT_GRANULARITY;

  const formattedStartDate = momentToDateString(startDate, granularity, rangeFormat);
  const formattedEndDate = momentToDateString(endDate, granularity, rangeFormat);

  return isSingleDate ? formattedEndDate : `${formattedStartDate} - ${formattedEndDate}`;
};

export const getDefaultStartDateAndEndDate = (
  isSingleDate,
  granularity = GRANULARITIES.DAY,
  minMomentDate = moment(DEFAULT_MIN_DATE),
  maxMomentDate = moment(),
) => {
  let defaultStartDate;
  let defaultEndDate;
  if (isSingleDate) {
    defaultStartDate = constrainDate(moment(), minMomentDate, maxMomentDate);
    defaultEndDate = defaultStartDate; // end date is the same, but gets rounded to the period below
  } else {
    defaultStartDate = minMomentDate;
    defaultEndDate = maxMomentDate;
  }
  const roundedDefaults = roundStartEndDates(granularity, defaultStartDate, defaultEndDate);
  defaultStartDate = roundedDefaults.startDate;
  defaultEndDate = roundedDefaults.endDate;
  return { defaultStartDate, defaultEndDate };
};
