/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * @typedef {Object[] | Object<string, Object>} ObjectCollection
 */

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
