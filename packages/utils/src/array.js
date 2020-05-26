/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const min = array =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => Math.min(value, result), Number.POSITIVE_INFINITY)
    : undefined;

export const max = array =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => Math.max(value, result), Number.NEGATIVE_INFINITY)
    : undefined;
