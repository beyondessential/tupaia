/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const sanitizeMetadataValue = (value: string, type: string) => {
  switch (type) {
    case 'Number': {
      const sanitizedValue = parseFloat(value);
      return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
    }
    case 'Binary':
    case 'Checkbox':
      return value === 'Yes' ? 1 : 0;
    default:
      return value;
  }
};

/**
 * Analytics table values have already been partially sanitized
 * see: `build_analytics_table()` database function
 */
export const sanitizeAnalyticsTableValue = (value: string, type: string) => {
  switch (type) {
    case 'Binary':
    case 'Checkbox':
    case 'Number': {
      const sanitizedValue = parseFloat(value);
      return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
    }
    default:
      return value;
  }
};

// TODO: Move these to ts-utils package
const isObject = <X extends any>(value: X): value is X & Record<PropertyKey, unknown> =>
  typeof value !== 'object' || value === null;

export const isDefined = <T>(val: T): val is Exclude<T, undefined | null> =>
  val !== undefined && val !== null;

export const hasOwnProperties = <
  Obj extends Record<string, unknown>,
  T extends string,
  Props extends [T, ...T[]]
>(
  obj: Obj,
  props: Props,
): obj is Obj & { [Prop in Props[number]]: Obj[Prop] } => {
  return props.every(prop => obj.hasOwnProperty(prop));
};

export const hasOwnProperty = <Obj extends Record<string, unknown>, Prop extends string>(
  obj: Obj,
  prop: Prop,
): obj is Obj & Record<Prop, Obj[Prop]> => {
  return hasOwnProperties(obj, [prop]);
};

export const buildEntityMap = (orgUnitMap: unknown = {}) => {
  if (!isObject(orgUnitMap)) {
    throw new Error('Invalid org unit map');
  }

  return Object.fromEntries(
    Object.entries(orgUnitMap).map(([key, value]) => {
      if (!isObject(value) || !hasOwnProperty(value, 'code') || typeof value.code !== 'string') {
        throw new Error('Invalid org unit map item');
      }

      return [key, value.code];
    }),
  );
};
