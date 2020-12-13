/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getAggregationsByCode } from './aggregation';
import { ArithmeticConfig, ExpandedArithmeticConfig } from './types';

export const expandConfig = (config: ArithmeticConfig): ExpandedArithmeticConfig => {
  const { defaultValues = {}, parameters = [], ...otherFields } = config;

  return {
    ...otherFields,
    defaultValues,
    parameters,
    aggregation: getAggregationsByCode(config),
  };
};
