/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testBuildAnalytics } from './testBuildAnalytics';
import { testGetAggregations } from './testGetAggregations';
import { testConfigValidation } from './testValidateConfig';

describe('ArithmeticBuilder', () => {
  describe('validateConfig()', testConfigValidation);

  describe('getAggregations()', testGetAggregations);

  describe('buildAnalytics()', testBuildAnalytics);
});
