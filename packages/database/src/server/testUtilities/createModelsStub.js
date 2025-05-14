/**
 * @typedef MockData
 * @type {Object.<string, MockModelSpec>}
 * Map of model name to spec, e.g.
 * {
 *   entity: {
 *     records: [{code: 'entity1'}],
 *     extraMethods: {
 *       getTypes: ['village', 'district']}
 *     }
 *   }
 */

/**
 * @typedef MockModelSpec
 * @type {Object}
 * @property {Object[]} records
 * @property {Object.<string, any>} [extraMethods]
 */

const mockFind = (array, criteria = {}) =>
  array.filter(currentObject => {
    for (const [key, value] of Object.entries(criteria)) {
      const comparator = Array.isArray(value)
        ? (item, arr) => arr.includes(item)
        : (a, b) => a === b;

      if (key.includes('->>')) {
        // Special case
        const [colName, ...nestedPropLookupPath] = key.split(/->>?/);
        if (currentObject[colName] == undefined) return false;

        const nestedPropVal = getNestedProp(nestedPropLookupPath, currentObject[colName]);

        if (!comparator(nestedPropVal, value)) return false;
      } else if (!comparator(currentObject[key], value)) {
        return false;
      }
    }
    return true;
  });

const mockFindOne = (array, criteria) => mockFind(array, criteria)[0] || undefined;

const getNestedProp = (selectorArray, obj) => {
  const [first, ...rest] = selectorArray;
  if (selectorArray.length > 1) {
    if (obj[first] === undefined) return undefined;
    return getNestedProp(rest, obj[first]);
  }
  return obj[first] ?? undefined;
};

/**
 * @param {MockData} mockData
 * @return {} a partial implementation of ModelRegistry, to be used in its place
 */
export const createModelsStub = mockData => {
  const mockModelRegistry = {
    wrapInTransaction: callback =>
      callback({
        ...mockModelRegistry,
        transacting: true,
      }),
  };

  for (const [modelName, mockModelSpec] of Object.entries(mockData)) {
    mockModelRegistry[modelName] = {
      find: criteria => mockFind(mockModelSpec.records, criteria),
      findOne: criteria => mockFindOne(mockModelSpec.records, criteria),
      findById: id => mockFindOne(mockModelSpec.records, { id }),
      ...mockModelSpec.extraMethods,
    };
  }

  return mockModelRegistry;
};
