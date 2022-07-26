/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
 * @property {Object.<string, any>} extraMethods
 */

const mockFind = (array, criteria = {}) =>
  array.filter(currentObject => {
    for (const [key, value] of Object.entries(criteria)) {
      const comparator = Array.isArray(value)
        ? (item, arr) => arr.includes(item)
        : (a, b) => a === b;

      if (key.includes('->>')) {
        // Special case
        const lookupPath = key.split('->>');
        if (lookupPath.length > 2) throw new Error('Not implemented yet...');
        const [colName, objProperty] = lookupPath;
        if (currentObject[colName] == undefined) return false;
        if (!comparator(currentObject[colName][objProperty], value)) return false;
      } else if (!comparator(currentObject[key], value)) {
        return false;
      }
    }
    return true;
  });

const mockFindOne = (array, criteria) => mockFind(array, criteria)[0] || undefined;

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
