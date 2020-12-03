/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregation, Indicator } from '../../types';

// Corresponds to a single aggregation
export type AggregationDescriptor = string | Aggregation;

// Specifies the aggregation(s) that should be applied to a list of elements
export type AggregationSpecs = AggregationDescriptor | AggregationDescriptor[];

export type ArithmeticConfig = {
  readonly formula: string;
  // If no `Record` is provided then the same `AggregationSpecs` will be applied to all elements
  readonly aggregation: AggregationSpecs | Record<string, AggregationSpecs>;
  readonly parameters?: Indicator[];
  readonly defaultValues?: Record<string, number>;
};
