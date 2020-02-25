/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * @typedef {Object[] | Object<string, Object>} ObjectCollection
 */

const compareAsc = (a, b) => {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, undefined, { numeric: true });
  }

  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
};

const compareDesc = (a, b) => compareAsc(a, b) * -1;

/**
 * Sorts the keys in the provided object by their corresponding values
 * Default direction: ASC
 *
 * @param {Object<string, Object>} object
 * @param {{ asc: boolean }} options
 * @returns {Array}
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
 * @param {{ ascending: boolean }} options
 * @returns {Function} A `(object1: object, object2: object) => number` function
 */
export function getSortByKey(key, options) {
  const compareValuesAscending = (a, b) => {
    const valueA = a[key];
    const valueB = b[key];

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

/**
 * Creates a dictionary which maps `keyProperty` of every object in `objectCollection` to `valueProperty`
 *
 * @param {ObjectCollection} objectCollection
 * @param {string} keyProperty
 * @param {string} valueProperty
 * @return {Object.<string, string>}
 */
export const reduceToDictionary = (objectCollection, keyProperty, valueProperty) => {
  const objects = collectionToArray(objectCollection);

  return objects.reduce(
    (dictionary, { [keyProperty]: key, [valueProperty]: value }) => ({
      ...dictionary,
      [key]: value,
    }),
    {},
  );
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
 * @param {Objcet} options
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
