import {
  value,
  first,
  last,
  unique,
  eq,
  notEq,
  exists,
  notExists,
  gt,
  length,
  any,
  all,
} from './basic';
import { orgUnitCodeToName } from './context';
import {
  convertToPeriod,
  dateStringToPeriod,
  periodToTimestamp,
  periodToDisplayString,
  periodToMoment,
  formatAsFractionAndPercentage,
} from './utils';
import { add, divide, sum, mean, min, max } from './math';

/**
 * Custom functions to be imported into mathjs
 */
export const customFunctions = {
  value,
  first,
  last,
  unique,
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
  periodToMoment,
  formatAsFractionAndPercentage,
  any,
  all,
};

export const contextFunctions = {
  orgUnitCodeToName: orgUnitCodeToName.func,
};

export const contextFunctionDependencies = {
  orgUnitCodeToName: orgUnitCodeToName.dependencies,
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
  mean,
  min,
  max,
};
