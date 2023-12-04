/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export const isDefined = <T>(value: T): value is Exclude<T, undefined> => value !== undefined;

export const isNotNullish = <T>(val: T): val is Exclude<T, undefined | null> =>
  val !== undefined && val !== null;

export const ensure = <T>(val: T) => {
  if (isNotNullish(val)) {
    return val;
  }

  throw new Error(`Unexpected null or undefined value`);
};

export const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);
