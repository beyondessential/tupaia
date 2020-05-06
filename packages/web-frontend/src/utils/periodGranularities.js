/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import moment from 'moment';

const DAY = 'day';
const SINGLE_DAY = 'one_day_at_a_time';
const WEEK = 'week';
const SINGLE_WEEK = 'one_week_at_a_time';
const MONTH = 'month';
const SINGLE_MONTH = 'one_month_at_a_time';
const YEAR = 'year';
const SINGLE_YEAR = 'one_year_at_a_time';

const START_OF_YEAR = 'start_of_year';

const CONFIG = {
  [DAY]: {
    chartFormat: 'Do MMMM YYYY',
    rangeFormat: 'Do MMMM YYYY',
    pickerFormat: 'D',
    momentShorthand: 'd',
    momentUnit: 'day',
  },
  [WEEK]: {
    chartFormat: 'D MMM YYYY',
    rangeFormat: '[W/C] D MMM YYYY',
    pickerFormat: '[W/C] D MMM YYYY',
    momentShorthand: 'w',
    momentUnit: 'isoWeek',
  },
  [MONTH]: {
    chartFormat: 'MMM YYYY',
    rangeFormat: 'MMM YYYY',
    pickerFormat: 'MMMM',
    momentShorthand: 'M',
    momentUnit: 'month',
  },
  [YEAR]: {
    chartFormat: 'YYYY',
    rangeFormat: 'YYYY',
    pickerFormat: 'YYYY',
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
  [YEAR]: CONFIG[YEAR],
  [SINGLE_YEAR]: CONFIG[YEAR],
};

export const GRANULARITIES_WITH_ONE_DATE = [SINGLE_DAY, SINGLE_WEEK, SINGLE_MONTH, SINGLE_YEAR];

export const GRANULARITY_SHAPE = PropTypes.oneOf([
  DAY,
  SINGLE_DAY,
  WEEK,
  SINGLE_WEEK,
  MONTH,
  SINGLE_MONTH,
  YEAR,
  SINGLE_YEAR,
]);

export function roundStartEndDates(granularity, startDate = moment(), endDate = moment()) {
  const { momentUnit } = GRANULARITY_CONFIG[granularity];
  return {
    startDate: startDate.clone().startOf(momentUnit),
    endDate: endDate.clone().endOf(momentUnit),
  };
}

const getDefaultStartDate = defaultStartDate => {
  switch (defaultStartDate) {
    case START_OF_YEAR:
      return moment().startOf('year');
    default:
      return null;
  }
};

export function getDefaultDates(state, infoViewKey) {
  const { periodGranularity, defaultTimePeriod, defaultStartDate } = state.global.viewConfigs[infoViewKey];
  let startDate = moment();
  let endDate = startDate;
  if (
    defaultTimePeriod &&
    (defaultTimePeriod.format === 'days' || defaultTimePeriod.format === 'years')
  ) {
    const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(periodGranularity);

    if (isSingleDate) {
      startDate = moment().add(defaultTimePeriod.value, defaultTimePeriod.format);
      endDate = startDate;

      return roundStartEndDates(periodGranularity, startDate, endDate);
    }
  } else if (defaultStartDate) {
    startDate = getDefaultStartDate(defaultStartDate);

    if (startDate) {
      return roundStartEndDates(periodGranularity, startDate, endDate);
    }
  }

  return {};
}
