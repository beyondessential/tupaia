/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { aggregations } from './aggregations';

export const buildGetFieldAggregation = (params: { [key: string]: keyof typeof aggregations }) => {
  if (Object.values(params).some(aggregation => !(aggregation in aggregations))) {
    throw new Error(`Expected all values to be one of ${Object.keys(aggregations)}`);
  }

  return (field: string): keyof typeof aggregations => {
    const aggregation = params[field];
    if (aggregation !== undefined) {
      return aggregation;
    }

    if ('...' in params) {
      return params['...'];
    }

    throw new Error(`No aggregation defined for ${field}`);
  };
};
