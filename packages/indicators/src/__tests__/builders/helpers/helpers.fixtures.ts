/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const AGGREGATION_RESPONSE_CONFIG = {
  BCD01: {
    expectedAggregations: [{ type: 'FINAL_EACH_WEEK' }],
    results: [{ value: 1 }],
  },
  BCD02: {
    expectedAggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
    results: [{ value: 2 }],
  },
  BCD03: {
    expectedAggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
    results: [{ value: 3 }],
  },
  BCD04: {
    expectedAggregations: [{ type: 'SUM' }, { type: 'FINAL_EACH_WEEK' }],
    results: [{ value: 4 }],
  },
};

export type AggregationResponseConfig = typeof AGGREGATION_RESPONSE_CONFIG;
