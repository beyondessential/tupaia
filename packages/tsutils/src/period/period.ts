/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const DAY = 'DAY';
const WEEK = 'WEEK';
const MONTH = 'MONTH';
const YEAR = 'YEAR';
const QUARTER = 'QUARTER';

/**
 * Available period formats for aggregation server data
 */
export const PERIOD_TYPES = {
  DAY, // e.g. '20180104'
  WEEK, // e.g. '2018W01'
  MONTH, // e.g. '201801'
  QUARTER, // e.g. '2018Q1'
  YEAR, // e.g. '2018'
} as const;
