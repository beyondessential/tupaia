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
 * Changes keys in `object` according to `mapping`. Keys that
 * do not exist in `mapping` will not be included in the result
 *
 * @param {Object<string, any>} object
 * @param {Object<string, string>} mapping `oldKey` => `newKey` mapping
 */
export const mapKeys = (object, mapping) => {
  const result = {};

  Object.entries(object).forEach(([key, value]) => {
    const newKey = mapping[key];
    if (newKey) {
      result[newKey] = value;
    }
  });

  return result;
};
