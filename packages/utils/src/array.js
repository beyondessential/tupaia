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

export const asyncFilter = async (array, predicate) =>
  Promise.all(array.map(predicate)).then(results => array.filter((_v, index) => results[index]));

// https://advancedweb.hu/how-to-use-async-functions-with-array-some-and-every-in-javascript/
export const asyncEvery = async (array, predicate) =>
  (await asyncFilter(array, predicate)).length === array.length;

/**
 *
 * @template T
 * @param {T} array
 * @param {number} index
 * @returns {T}
 */
export const removeAt = (array, index) => {
  if (typeof index !== 'number' || index < 0 || !Number.isFinite(index)) {
    throw new Error(`Index '${index}' is not a positive integer`);
  }
  return [...array.slice(0, index), ...array.slice(index + 1)];
};
