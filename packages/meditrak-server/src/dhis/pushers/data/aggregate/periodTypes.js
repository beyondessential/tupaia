/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { get } from 'lodash';

const DAILY = 'Daily';
const WEEKLY = 'Weekly';
const MONTHLY = 'Monthly';
const YEARLY = 'Yearly';

/**
 * Available period formats for aggregation server data
 */
export const PERIOD_TYPES = {
  DAILY, // e.g. '20180104'
  WEEKLY, // e.g. '2018W01'
  MONTHLY, // e.g. '201801'
  YEARLY, // e.g. '2018'
};
export const DEFAULT_PERIOD_TYPE = PERIOD_TYPES.DAILY;

const PERIOD_TYPE_CONFIG = {
  [DAILY]: {
    format: 'YYYYMMDD',
    length: 8,
    momentUnit: 'day',
  },
  [WEEKLY]: {
    format: 'GGGG[W]WW',
    length: 7,
    momentUnit: 'isoWeek',
  },
  [MONTHLY]: {
    format: 'YYYYMM',
    length: 6,
    momentUnit: 'month',
  },
  [YEARLY]: {
    format: 'YYYY',
    length: 4,
    momentUnit: 'year',
  },
};

export const PERIOD_LENGTH_TO_TYPE = {};
Object.entries(PERIOD_TYPE_CONFIG).forEach(([periodType, { length }]) => {
  PERIOD_LENGTH_TO_TYPE[length] = periodType;
});

const createAccessor = field => periodType => get(PERIOD_TYPE_CONFIG, [periodType, field]);
export const periodTypeToFormat = createAccessor('format');
export const periodTypeToMomentUnit = createAccessor('momentUnit');

export const periodToType = period => PERIOD_LENGTH_TO_TYPE[period.length];
