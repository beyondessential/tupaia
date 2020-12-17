/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testCalculations } from './testCalculation';
import { testConfigValidation } from './testConfigValidation';
import { testDataFetching } from './testDataFetching';
import { testParameters } from './testParameters';

describe('buildArithmetic', () => {
  describe('config validation', testConfigValidation);

  describe('data fetching', testDataFetching);

  describe('calculations', testCalculations);

  describe('parameters', testParameters);
});
