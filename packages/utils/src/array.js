/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * @param {any[]} array
 * @param {(Function|string)} [mapperInput]
 * @returns {number}
 */
export const countDistinct = (array, mapperInput) => {
  const getMapper = () => {
    switch (typeof mapperInput) {
      case 'function':
        return value => mapperInput(value);
      case 'string':
        return value => value[mapperInput];
      default:
        return value => value;
    }
  };

  const mapItem = getMapper();
  return new Set(array.map(mapItem)).size;
};

export const min = array =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => Math.min(value, result), Number.POSITIVE_INFINITY)
    : undefined;

export const max = array =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => Math.max(value, result), Number.NEGATIVE_INFINITY)
    : undefined;

export const toArray = input => (Array.isArray(input) ? input : [input]);
