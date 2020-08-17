/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';

import {
  getAggregationsByCode,
  extractDataElementCodesFromFormula,
  fetchAnalytics,
} from './helpers';
import { Builder, AggregationSpecs, FetchOptions } from '../types';

interface ArithmeticConfig {
  formula: string;
  aggregation: AggregationSpecs;
}

const validateConfig = (config: ArithmeticConfig) => {
  const { formula, aggregation } = config;
  const codesInFormula = extractDataElementCodesFromFormula(formula);

  codesInFormula.forEach(codeInFormula => {
    if (!Object.keys(aggregation).includes(codeInFormula)) {
      throw new Error(
        `Data element ${codeInFormula} is referenced in the formula but has no aggregation defined`,
      );
    }
  });
};

export const buildArithmetic: Builder<ArithmeticConfig> = async (input: {
  aggregator: Aggregator;
  config: ArithmeticConfig;
  fetchOptions: FetchOptions;
}) => {
  const { aggregator, config, fetchOptions } = input;
  validateConfig(config);

  const { formula, aggregation: aggregationSpecs } = config;
  const aggregationsByCode = getAggregationsByCode(aggregationSpecs);
  const analytics = await fetchAnalytics(aggregator, aggregationsByCode, fetchOptions);

  // TODO implement
  return [];
};
