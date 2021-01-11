/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregation, Indicator } from '../../../types';

/**
 * A single aggregation
 */
export type AggregationDescriptor = string | Aggregation;

/**
 * A list of aggregation(s) that will be applied to a data element
 */
export type AggregationSpecs = AggregationDescriptor | AggregationDescriptor[];

/**
 * 'undefined' can be passed in to treat the value as "optional"
 * in supported calculations (eg `avg(a, b)`)
 */
type DefaultValue = number | 'undefined';

/**
 * A flexible config schema that can be provided as an input to the indicator
 */
export type ArithmeticConfig = {
  readonly formula: string;
  // If `AggregationSpecs` (and not a Record) is passed, it will be applied to all elements in `formula`
  readonly aggregation: AggregationSpecs | Record<string, AggregationSpecs>;
  readonly parameters?: Indicator[];
  readonly defaultValues?: Record<string, DefaultValue>;
};

/**
 * A fully expanded, verbose config containing as much information as possible.
 * Useful for internal code purposes
 */
export type ExpandedArithmeticConfig = {
  readonly formula: string;
  readonly aggregation: Record<string, Aggregation[]>;
  readonly parameters: Indicator[];
  readonly defaultValues: Record<string, DefaultValue>;
};
