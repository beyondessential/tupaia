/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { compareAsc, compareDesc } from './compare';
import { getUniqueEntries } from './getUniqueEntries';

/**
 * @typedef {Object<string, any>[] | Object<string, Object<string, any>>} ObjectCollection
 */

/**
 * Sorts the keys in the provided object by their corresponding values
 * Default direction: ASC
 *
 * @param {Object<string, any>} object
 * @param {{ asc: boolean }} options
 * @returns {string[]}
 */
export const getKeysSortedByValues = (object, options = {}) => {
  const { asc = true } = options || {};
  const comparator = asc ? compareAsc : compareDesc;

  return Object.keys(object).sort((keyA, keyB) => comparator(object[keyA], object[keyB]));
};

/**
 * Returns a callback which compares two objects using the provided `key` .
 * Can be used in `Array.prototype.sort` for an array of objects
 *
 * @param {string} key
 * @param {{ ascending: boolean }} [options]
 * @returns { (a: Object<string, any>, b: Object<string, any> ) => number }
 */
export function getSortByKey(key, options) {
  return getSortByExtractedValue(o => o[key], options);
}

/**
 * Returns a callback which compares two objects using the provided `function` .
 * Can be used in `Array.prototype.sort` for an array of objects
 *
 * @param {Function} valueExtractor function to extract the comparison value
 * @param {{ ascending: boolean }} [options]
 * @returns { (a: Object<string, any>, b: Object<string, any> ) => number }
 */
export function getSortByExtractedValue(valueExtractor, options) {
  const compareValuesAscending = (a, b) => {
    const valueA = valueExtractor(a);
    const valueB = valueExtractor(b);

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return valueA.localeCompare(valueB, undefined, { numeric: true });
    }

    if (valueA < valueB) {
      return -1;
    }
    return valueA > valueB ? 1 : 0;
  };

  const { ascending = true } = options || {};
  return (a, b) => {
    const ascValue = compareValuesAscending(a, b);
    return ascending ? ascValue : ascValue * -1;
  };
}

const collectionToArray = collection =>
  Array.isArray(collection) ? collection : Object.values(collection);

/**
 * @param {ObjectCollection} objectCollection
 * @returns {Object<string, any>}
 */
export const flattenToObject = objectCollection => {
  const objects = collectionToArray(objectCollection);

  return objects.reduce(
    (result, object) => ({
      ...result,
      ...object,
    }),
    {},
  );
};

const buildKeyAndValueFunctions = (keyMapper, valueMapper) => {
  const keyOf = typeof keyMapper === 'function' ? keyMapper : object => object[keyMapper];
  const valueOf = typeof valueMapper === 'function' ? valueMapper : object => object[valueMapper];
  return [keyOf, valueOf];
};

/**
 * Creates a dictionary which maps the values of a selected field to another field
 * Available field (key/value) mapper types:
 * * `string`: uses the provided string as the field key
 * * `Function`, will receive the object as its input eg object => object.value * 2
 *
 * @param {ObjectCollection} objectCollection
 * @param {string|Function} keyMapper
 * @param {string|Function} valueMapper
 * @return {Object<string, string>}
 */
export const reduceToDictionary = (objectCollection, keyMapper, valueMapper) => {
  const objects = collectionToArray(objectCollection);
  const [keyOf, valueOf] = buildKeyAndValueFunctions(keyMapper, valueMapper);
  const dictionary = {};
  // Using `forEach` is much quicker than using `reduce` with a spread operator on the accumulator
  objects.forEach(object => {
    dictionary[keyOf(object)] = valueOf(object);
  });
  return dictionary;
};

/**
 * Creates a dictionary which maps the values of a selected field to an array of matching values another field
 * Use this function when you expect multiple objects in the collection to map to the same key, otherwise use reduceToDictionary
 * Available field (key/value) mapper types:
 * * `string`: uses the provided string as the field key
 * * `Function`, will receive the object as its input eg object => object.value * 2
 *
 * @param {ObjectCollection} objectCollection
 * @param {string|Function} keyMapper
 * @param {string|Function} valueMapper
 * @return {Object<string, string[]>}
 */
export const reduceToArrayDictionary = (objectCollection, keyMapper, valueMapper) => {
  const objects = collectionToArray(objectCollection);
  const [keyOf, valueOf] = buildKeyAndValueFunctions(keyMapper, valueMapper);
  const dictionary = {};
  // Using `forEach` is much quicker than using `reduce` with a spread operator on the accumulator
  objects.forEach(object => {
    if (dictionary[keyOf(object)]) {
      dictionary[keyOf(object)].push(valueOf(object));
    } else {
      dictionary[keyOf(object)] = [valueOf(object)];
    }
  });
  return dictionary;
};

/**
 * @param {ObjectCollection} objectCollection
 * @param {string} property
 * @returns {Set}
 */
export const reduceToSet = (objectCollection, property) => {
  const objects = collectionToArray(objectCollection);

  return objects.reduce((set, { [property]: value }) => {
    set.add(value);
    return set;
  }, new Set());
};

/**
 * Changes keys in `object` according to `mapping`
 *
 * @param {Object<string, any>} object
 * @param {Object<string, string>} mapping `oldKey` => `newKey` mapping
 * @param {Object} options
 * @returns {Object<string, any>}
 */
export const mapKeys = (object, mapping, { defaultToExistingKeys = false } = {}) => {
  const result = {};

  Object.entries(object).forEach(([key, value]) => {
    if (mapping.hasOwnProperty(key)) {
      const newKey = mapping[key];
      result[newKey] = value;
    } else if (defaultToExistingKeys) {
      result[key] = value;
    }
  });

  return result;
};

/**
 * Changes values in `object` according to `mapping`
 *
 * @param {Object<string, any>} object
 * @param {Object<string, string>} mapping `oldValue` => `newValue` mapping
 * @param {Object} options
 * @returns {Object<string, any>}
 */
export const mapValues = (object, mapping, { defaultToExistingValues = false } = {}) => {
  const result = {};

  Object.entries(object).forEach(([key, value]) => {
    if (mapping.hasOwnProperty(value)) {
      const newValue = mapping[value];
      result[key] = newValue;
    } else if (defaultToExistingValues) {
      result[key] = value;
    }
  });

  return result;
};

/**
 * Filters the entries of an object based on its values
 *
 * @param {Object<string, any>} object
 * @param {Function} valueFilter
 * @returns {Object<string, any>}
 */
export const filterValues = (object, valueFilter) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => valueFilter(value)));

export const stripFields = (object = {}, fieldsToExclude = []) =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !fieldsToExclude.includes(key)));

/**
 * Note: this only guarantees insertion order for properties in the new object.
 * Enumeration order is not guaranteed before ES2015
 */
const sortFields = object => {
  const sortedEntries = Object.entries(object).sort(([keyA], [keyB]) => compareAsc(keyA, keyB));
  return Object.fromEntries(sortedEntries);
};

export const getUniqueObjects = objects => {
  const jsonStrings = objects.map(o => JSON.stringify(sortFields(o)));
  return getUniqueEntries(jsonStrings).map(JSON.parse);
};
