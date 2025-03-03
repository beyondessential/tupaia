import { compareAsc } from './compare';

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

export const hasIntersection = (input1, input2) => {
  const set1 = new Set(input1);
  const set2 = new Set(input2);

  for (const v of set1) {
    if (set2.has(v)) {
      return true;
    }
  }
  return false;
};

export const min = array =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => (compareAsc(value, result) <= 0 ? value : result), array[0])
    : undefined;

export const max = array =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => (compareAsc(value, result) >= 0 ? value : result), array[0])
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
