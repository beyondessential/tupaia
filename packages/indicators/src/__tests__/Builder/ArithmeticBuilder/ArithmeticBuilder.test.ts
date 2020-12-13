/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testCalculations } from './testCalculations';
import { testConfigValidation } from './testConfigValidation';
import { testDataFetching } from './testDataFetching';
import { testParameters } from './testParameters';

describe('ArithmeticBuilder', () => {
  describe('buildAnalyticValues()', () => {
    describe('config validation', testConfigValidation);

    describe('data fetching', testDataFetching);

    describe('calculations', testCalculations);

    describe('parameters', testParameters);
  });
});
