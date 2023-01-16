/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DateOffset = {
  unit: PeriodType;
  offset?: number;
  modifier?: 'start_of' | 'end_of';
  modifierUnit?: PeriodType;
  from?: string;
};

export type DateSpecs = string | DateOffset;

export type PeriodParams = {
  period?: string;
  startDate?: string;
  endDate?: string;
};

export type FetchReportQuery = PeriodParams & {
  organisationUnitCodes: string[];
  hierarchy: string;
};

export type AggregationObject = {
  type: string;
  config?: Record<string, unknown>;
};

export type Aggregation = string | AggregationObject;

type Transform = string | Record<string, unknown>;

type CustomReportConfig = {
  customReport: string;
};

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

export type StandardOrCustomReportConfig = ReportConfig | CustomReportConfig;

export interface Event {
  event: string;
  eventDate: string;
  orgUnitName: string;
  orgUnit: string;
  dataValues?: Record<string, string | number>;
}

export interface TransformSchema {
  code: string;
  alias?: boolean;
  string?: Record<string, string | boolean | string[]> | null;
}
