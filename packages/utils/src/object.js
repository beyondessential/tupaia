import { camel, snake } from 'case';

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
 * @returns { (a: any, b: any ) => number }
 */
export function getSortByKey(key, options) {
  return getSortByExtractedValue(o => o[key], options);
}

/**
 * @template T
 * @param {T[]} array
 * @param { (string | (value: T) => unknown)[] } valueMappers
 * @param {*} orders
 * @returns {T[]}
 */
export const orderBy = (array, valueMappers, orders = []) => {
  const comparators = valueMappers.map((valueMapper, i) => {
    const mapValue =
      typeof valueMapper === 'string' ? obj => obj?.[valueMapper] : obj => valueMapper(obj);
    const order = typeof orders[i] === 'string' ? orders[i].toLowerCase() : 'asc';
    const compare = order === 'desc' ? compareDesc : compareAsc;

    return (a, b) => compare(mapValue(a), mapValue(b));
  });

  return array.sort((a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }
    }

    // No comparator was able to evaluate the items as not equal
    return 0;
  });
};

/**
 * Returns a callback which compares two objects using the provided `function` .
 * Can be used in `Array.prototype.sort` for an array of objects
 *
 * @param {Function} valueExtractor function to extract the comparison value
 * @param {{ ascending: boolean }} [options]
 * @returns { (a: Object<string, any>, b: Object<string, any> ) => number }
 */
export function getSortByExtractedValue(valueExtractor, options) {
  const { ascending = true } = options || {};
  const comparator = ascending ? compareAsc : compareDesc;
  return (a, b) => comparator(valueExtractor(a), valueExtractor(b));
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
 * @template {Object} T
 *
 * @param {T[] | Record<string, T>} objectCollection
 * @param {string | (object: T) => string} keyMapper
 * @param {string | (object: T) => string} valueMapper
 * @return {Record<string, string>}
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
    const keyOfObject = keyOf(object);
    if (dictionary[keyOfObject]) {
      dictionary[keyOfObject].push(valueOf(object));
    } else {
      dictionary[keyOfObject] = [valueOf(object)];
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
 * Note: this generally only guarantees insertion order for properties in the new object.
 * Traversal order is not specified and thus not guaranteed in older ES versions.
 * If order and cross-version support is critical, please use an Array instead
 * @see https://github.com/tc39/proposal-for-in-order
 */
export const sortFields = object => {
  const sortedEntries = Object.entries(object).sort(([keyA], [keyB]) => compareAsc(keyA, keyB));
  return Object.fromEntries(sortedEntries);
};

export const getUniqueObjects = objects => {
  const jsonStrings = objects.map(o => JSON.stringify(sortFields(o)));
  return getUniqueEntries(jsonStrings).map(JSON.parse);
};

/**
 * @param {ObjectCollection} objectCollection
 */
export const haveSameFields = (objectCollection, fields) => {
  const objects = collectionToArray(objectCollection);

  return fields.every(field => {
    for (let i = 0; i < objects.length; i++) {
      for (let j = i; j < objects.length; j++) {
        if (objects[i][field] !== objects[j][field]) {
          return false;
        }
      }
    }

    return true;
  });
};

export const camelKeys = object =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [camel(key), value]));

/**
 * {@link snake}, but preserves `->` and `->>` PostgreSQL json/jsonb operators.
 * @param {string} str
 * @returns {string}
 */
export function jsonOperatorAwareSnake(str) {
  /**
   * @privateRemarks
   * - Parentheses are NOT redundant; we need the matched operators in output array of
   *   {@link String.prototype.split}.
   * - Does NOT match `#>` or `#>>` standard comparison operators, or any additional jsonb-only
   *   operators. (No reason other than that we haven’t needed them yet.)
   * @see https://www.postgresql.org/docs/current/functions-json.html
   * @example 'country_code' → ['country_code']
   * @example 'config->item->>colour' → ['config', '->', 'item', '->>', 'colour']
   */
  const substrings = str.split(/(->>?)/);

  // Redundant short-circuit, but this is a hot path. (No JSON operators present.)
  if (substrings.length === 1) return snake(str);

  // Assume input string is valid PostgreSQL json or jsonb clause, which cannot start with an
  // operator. (`->` and `->>` are binary operators.)
  return substrings
    .map((substring, i) => {
      const isOperand = i % 2 === 0; // Operands at even indexes; operators at odd indexes
      return isOperand ? snake(substring) : substring; // snake otherwise converts '->>' into '_'
    })
    .join('');
}

export const snakeKeys = object => {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [jsonOperatorAwareSnake(key), value]),
  );
};
