/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { find, isString, isNumber } from 'lodash';
import {
  PresentationOptions,
  ConditionValue,
  RangePresentationOptions,
  ConditionalPresentationOptions,
  PresentationOptionCondition,
} from '@tupaia/types';
import { MatrixColumnType } from '../../types';

/**
 * This file contains any utils that useful for the matrix component. This is mainly used for presentation options
 */
export const areStringsEqual = (a: string, b: string, caseSensitive = true) =>
  a
    .toString()
    .localeCompare(b.toString(), undefined, caseSensitive ? {} : { sensitivity: 'accent' }) === 0;

// This converts hex to RGBA for use when transforming colours from the presentation options to be semi-transparent
export const hexToRgba = (hex: string, opacity: number) => {
  let hexString = hex.replace('#', '');
  // If the hex is shortened, double up each character. This is for cases like '#fff'
  const isShortened = hexString.length === 3;
  if (isShortened) hexString = hexString.replace(/(.)/g, '$1$1');
  return `#${hexString}`;
};

export const findByKey = (
  collection: PresentationOptions['conditions'],
  key: string,
  caseSensitive = true,
) =>
  (isString(key) || isNumber(key)) &&
  find(collection, (value, valueKey) => areStringsEqual(key, valueKey, caseSensitive));

/** Functions used to get matrix chart dot colors from presentation options */
const PRESENTATION_TYPES = {
  RANGE: 'range',
  CONDITION: 'condition',
};

const CONDITION_CHECK_METHOD = {
  '=': (value: any, filterValue: ConditionValue) => value === filterValue,
  '>': (value: number, filterValue: number) => value > filterValue,
  '<': (value: number, filterValue: number) => value < filterValue,
  '>=': (value: number, filterValue: number) => value >= filterValue,
  '<=': (value: number, filterValue: number) => value <= filterValue,
};

// This function is used to get the presentation option from the conditions, where the key is the value
const getPresentationOptionFromKey = (options: PresentationOptions['conditions'], value: any) =>
  findByKey(options, value, false) || null;

// This function is used to get the presentation option from the conditions, when conditions is an array
const getPresentationOptionFromCondition = (
  options: ConditionalPresentationOptions = {},
  value: any,
) => {
  const { conditions = [] } = options;

  const option = conditions.find(
    ({ condition }: { condition: PresentationOptionCondition['condition'] }) => {
      if (typeof condition === 'object') {
        // Check if the value satisfies all the conditions if condition is an object
        return Object.entries(condition).every(([operator, conditionalValue]) => {
          const checkConditionMethod =
            CONDITION_CHECK_METHOD[operator as keyof typeof CONDITION_CHECK_METHOD];

          return checkConditionMethod
            ? checkConditionMethod(value, conditionalValue as number)
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
export const getPresentationOption = (options: PresentationOptions, value: any) => {
  switch (options.type) {
    case PRESENTATION_TYPES.RANGE:
      return getPresentationOptionFromRange(options as RangePresentationOptions, value);
    case PRESENTATION_TYPES.CONDITION:
      return getPresentationOptionFromCondition(options as ConditionalPresentationOptions, value);
    default:
      return getPresentationOptionFromKey(options?.conditions, value);
  }
};

export function getIsUsingDots(presentationOptions: PresentationOptions = {}) {
  return Object.keys(presentationOptions).length > 0;
}

export function checkIfApplyDotStyle(
  presentationOptions: ConditionalPresentationOptions = {},
  columnIndex: number,
) {
  const appliedLocations = presentationOptions?.applyLocation?.columnIndexes;
  if (!appliedLocations) return true;
  return appliedLocations.includes(columnIndex);
}

// This function returns a flattened array of columns, NOT including the parent columns
export function getFlattenedColumns(columns: MatrixColumnType[]): MatrixColumnType[] {
  return columns.reduce((cols, column) => {
    if (column.children) {
      return [...cols, ...getFlattenedColumns(column.children)];
    }
    return [...cols, column];
  }, [] as MatrixColumnType[]);
}

// This function returns the displayed columns, based on the start column and max columns
export function getDisplayedColumns(
  columns: MatrixColumnType[],
  startColumn: number,
  maxColumns: number,
) {
  return getFlattenedColumns(columns).slice(startColumn, startColumn + maxColumns);
}
