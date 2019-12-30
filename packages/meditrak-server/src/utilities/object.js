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
