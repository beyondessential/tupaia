/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { value, last, eq, notEq, exists, notExists, gt } from './basic';
import {
  convertToPeriod,
  dateStringToPeriod,
  periodToTimestamp,
  periodToDisplayString,
  formatAsFractionAndPercentage,
} from './utils';
import { sum, divide } from './math';

export const functions = {
  value,
  last,
  eq,
  notEq,
  gt,
  exists,
  notExists,
  convertToPeriod,
  dateStringToPeriod,
  periodToTimestamp,
  periodToDisplayString,
  sum,
  divide,
  formatAsFractionAndPercentage,
};
