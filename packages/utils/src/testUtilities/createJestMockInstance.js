/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import get from 'lodash.get';

/**
 * Usage:
 *
 * ```js
 * const dhisApiMock = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');
 * const serviceMock = createJestMockInstance('@tupaia/data-broker/src/services/Service', 'Service', {
 *   pull: async () => {},
 * });
 * ```
 */
export const createJestMockInstance = (modulePath, classPath = 'default', overrides = {}) => {
  if (modulePath.startsWith('.')) {
    throw new Error(
      'Please use a path starting with a monorepo package, eg "@tupaia/packageName/path"',
    );
  }

  const MockClass = get(jest.createMockFromModule(modulePath), classPath);
  Object.entries(overrides).forEach(([key, value]) => {
    MockClass.prototype[key] = value;
  });
  return new MockClass();
};
