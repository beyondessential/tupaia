/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

type DateOffset = {
  unit: PeriodType;
  offset?: number;
  modifier?: 'start_of' | 'end_of';
  modifierUnit?: PeriodType;
  from?: string;
};

type DateSpecs = string | DateOffset;

type AggregationObject = {
  type: string;
  config?: Record<string, unknown>;
};

type Aggregation = string | AggregationObject;

type Transform = string | Record<string, unknown>;

export type ReportConfig = {
  fetch: {
    dataElements?: string[];
    dataGroups?: string[];
    aggregations?: Aggregation[];
    startDate?: DateSpecs;
    endDate?: DateSpecs;
    organisationUnits?: string[];
  };
  transform: Transform[];
  output?: Record<string, unknown>;
};
