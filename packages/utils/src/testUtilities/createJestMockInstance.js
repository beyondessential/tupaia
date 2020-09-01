/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import get from 'lodash.get';

import { jest } from '@jest/globals';

/**
 * Usage examples
 *
 * ```js
 * const mockDhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');
 * const mockAggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', {
 *   fetchAnalytics: async () => {},
 * });
 * ```
 */
export const createJestMockInstance = (modulePath, classPath = 'default', overrides = {}) => {
  const MockClass = get(jest.createMockFromModule(modulePath), classPath);
  Object.entries(overrides).forEach(([key, value]) => {
    MockClass.prototype[key] = value;
  });

  return new MockClass();
};
