/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { find, isString, isNumber } from 'lodash';
import { PresentationOptions, ConditionValue } from '@tupaia/types';

/**
 * This file contains any utils that useful for the matrix component. This is mainly used for presentation options
 */
export const areStringsEqual = (a: string, b: number, caseSensitive = true) =>
  a
    .toString()
    .localeCompare(b.toString(), undefined, caseSensitive ? {} : { sensitivity: 'accent' }) === 0;

export const hexToRgba = (hex: string, opacity: number) => {
  let hexString = hex.replace('#', '');
  const isShortened = hexString.length === 3;
  if (isShortened) hexString = hexString.replace(/(.)/g, '$1$1');
  const r = parseInt(hexString.substring(0, 2), 16);
  const g = parseInt(hexString.substring(2, 4), 16);
  const b = parseInt(hexString.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

export const findByKey = (
  collection: PresentationOptions['conditions'],
  key: string,
  caseSensitive = true,
) =>
  (isString(key) || isNumber(key)) &&
  find(collection, (value, i) => areStringsEqual(key, i, caseSensitive));

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

const getPresentationOptionFromKey = (options: PresentationOptions['conditions'], value: any) =>
  findByKey(options, value, false) || null;

const getPresentationOptionFromCondition = (options: PresentationOptions = {}, value: any) => {
  const { conditions = [] } = options;

  const option = conditions.find(({ condition }) => {
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
  });

  return option;
};

export const getPresentationOption = (options: PresentationOptions, value: any) => {
  switch (options.type) {
    // case PRESENTATION_TYPES.RANGE:
    //   return getPresentationOptionFromRange(options, value);
    case PRESENTATION_TYPES.CONDITION:
      return getPresentationOptionFromCondition(options, value);
    default:
      return getPresentationOptionFromKey(options?.conditions, value);
  }
};

export function getIsUsingDots(presentationOptions: PresentationOptions) {
  return Object.keys(presentationOptions).length > 0;
}

export function checkIfApplyDotStyle(presentationOptions: PresentationOptions) {
  return presentationOptions?.applyLocation?.columnIndexes;
}
