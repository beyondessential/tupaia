/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { value, last, eq, notEq, exists, notExists, gt, length, any, all } from './basic';
import { orgUnitCodeToName, dataElementCodeToName, orgUnitIdToCode } from './context';
import {
  convertToPeriod,
  dateStringToPeriod,
  periodToTimestamp,
  periodToDisplayString,
  formatAsFractionAndPercentage,
} from './utils';
import { add, divide, sum } from './math';

/**
 * Custom functions to be imported into mathjs
 */
export const customFunctions = {
  value,
  last,
  eq,
  notEq,
  gt,
  exists,
  notExists,
  length,
  convertToPeriod,
  dateStringToPeriod,
  periodToTimestamp,
  periodToDisplayString,
  formatAsFractionAndPercentage,
  any,
  all,
};

export const contextFunctionConfigs = {
  orgUnitCodeToName,
  dataElementCodeToName,
  orgUnitIdToCode,
};

/**
 * Functions to extend existing mathjs functions
 */
export const functionExtensions = {
  add,
  divide,
};

/**
 * Functions to override existing mathjs functions
 */
export const functionOverrides = {
  sum,
};
