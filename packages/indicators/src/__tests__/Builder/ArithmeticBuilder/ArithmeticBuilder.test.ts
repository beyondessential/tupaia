/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Indicator } from '../../../types';
import { testBuildAnalytics } from './testBuildAnalytics';
import { getAggregationListsMap } from './testGetAggregationListsMap';
import { testGetElementCodes } from './testGetElementCodes';
import { testConfigValidation } from './testValidateConfig';

jest.mock('../../../Builder/createBuilder', () => ({
  createBuilder: jest.fn().mockImplementation((indicator: Indicator) => ({
    getElementCodes: () => indicator.config.elementCodes,
  })),
}));

describe('ArithmeticBuilder', () => {
  describe('validateConfig()', testConfigValidation);

  describe('getAggregationListsMap()', getAggregationListsMap);

  describe('getElementCodes()', testGetElementCodes);

  describe('buildAnalytics()', testBuildAnalytics);
});
