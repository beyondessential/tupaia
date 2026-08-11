/*
 * This file contains any utils that useful for the matrix component. This is mainly used for
 * presentation options.
 */

import { find, isNumber, isString } from 'es-toolkit/compat';
import {
  ConditionalPresentationOptions,
  ConditionValue,
  MatrixPresentationOptions,
  PresentationOptionCondition,
  RangePresentationOptions,
} from '@tupaia/types';
import { MatrixColumnType } from '../../types';

export const areStringsEqual = (a: string, b: string, caseSensitive = true) =>
  a
    .toString()
    .localeCompare(b.toString(), undefined, caseSensitive ? {} : { sensitivity: 'accent' }) === 0;

export const findByKey = (
  collection: MatrixPresentationOptions['conditions'],
  key: string,
  caseSensitive = true,
) =>
  (isString(key) || isNumber(key)) &&
  find(collection, (_value, valueKey) => areStringsEqual(key, valueKey, caseSensitive));

/** Functions used to get matrix chart dot colors from presentation options */

const CONDITION_CHECK_METHOD = {
  '=': (value: any, filterValue: ConditionValue) => {
    // Make sure we are comparing the same types
    if (typeof filterValue === 'number') {
      return parseFloat(value) === filterValue;
    }
    return value === filterValue;
  },
  '>': (value: number, filterValue: number) => value > filterValue,
  '<': (value: number, filterValue: number) => value < filterValue,
  '>=': (value: number, filterValue: number) => value >= filterValue,
  '<=': (value: number, filterValue: number) => value <= filterValue,
};

// This function is used to get the presentation option from the conditions, where the key is the value
const getPresentationOptionFromKey = (
  options: MatrixPresentationOptions['conditions'],
  value: any,
) => findByKey(options, value, false) || null;

// This function is used to get the presentation option from the conditions, when conditions is an array
const getPresentationOptionFromCondition = (
  options: ConditionalPresentationOptions = {},
  value: any,
) => {
  const { conditions = [] } = options;
  // handle undefined values so they don't accidentally get displayed as the default condition
  if (value === undefined) return null;

  const option = conditions.find(
    ({ condition }: { condition: PresentationOptionCondition['condition'] }) => {
      if (typeof condition === 'object') {
        // Check if the value satisfies all the conditions if condition is an object
        return Object.entries(condition).every(([operator, conditionalValue]) => {
          const checkConditionMethod =
            CONDITION_CHECK_METHOD[operator as keyof typeof CONDITION_CHECK_METHOD];

          let parsedValue = value;

          if (operator !== '=') {
            // If operator is not '=' then we need to parse the value to a number
            parsedValue = parseFloat(parsedValue);
          }

          return checkConditionMethod
            ? checkConditionMethod(parsedValue, conditionalValue as number)
            : false;
        });
      }

      // If condition is not an object, assume its the value we want to check (with '=' operator)
      const checkConditionMethod = CONDITION_CHECK_METHOD['='];
      return checkConditionMethod(value, condition);
    },
  );

  return option;
};

// This function returns the applicable presentation option from range type presentation options
export const getPresentationOptionFromRange = (options: RangePresentationOptions, value: any) => {
  const { type, showRawValue, ...rest } = options;
  const option = Object.values(rest).find(({ min, max }) => {
    return min !== undefined && value >= min && (max === undefined || value <= max);
  });
  if (value === undefined || value === '' || option === undefined) return null;
  return option;
};

// This function returns the applicable presentation option from the presentation options, for the value
export const getPresentationOption = (options?: MatrixPresentationOptions, value?: any) => {
  if (!options) return null;
  if (options.type === 'range') return getPresentationOptionFromRange(options, value);
  if (options.type === 'condition') return getPresentationOptionFromCondition(options, value);
  return getPresentationOptionFromKey(options?.conditions, value);
};

export function getIsUsingPillCell(presentationOptions?: MatrixPresentationOptions) {
  return presentationOptions
    ? Object.keys(presentationOptions).filter(optionName => !optionName.includes('export')).length >
        0
    : false;
}

export function checkIfApplyPillCellStyle(
  presentationOptions?: MatrixPresentationOptions,
  columnIndex?: number,
) {
  if (!presentationOptions || columnIndex === undefined) return false;
  const { applyLocation } = presentationOptions;
  if (applyLocation && 'columnIndexes' in applyLocation && applyLocation?.columnIndexes) {
    return applyLocation.columnIndexes.includes(columnIndex);
  }
  return true;
}

// This function returns a flattened array of columns, NOT including the parent columns
export function getFlattenedColumns(columns: MatrixColumnType[]): MatrixColumnType[] {
  return columns.reduce((cols, column) => {
    if (column.children) {
      const childCols = getFlattenedColumns(column.children);
      cols.push(...childCols);
      return cols;
    }
    cols.push(column);
    return cols;
  }, [] as MatrixColumnType[]);
}
