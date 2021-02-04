/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';

/*
 * WARNING - These constants are duplicated from web-frontend
 * If updating them here, you need to update them there as well
 */

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
    chartFormat: 'Do MMMM YYYY',
    rangeFormat: 'Do MMMM YYYY',
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
