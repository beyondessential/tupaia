/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { ReportModel } from './models';

export interface ReportServerModelRegistry extends ModelRegistry {
  readonly report: ReportModel;
}

export type PeriodParams = {
  period?: string;
  startDate?: string;
  endDate?: string;
};

export type FetchReportQuery = PeriodParams & {
  organisationUnitCodes: string[];
  hierarchy?: string;
};

export type AggregationObject = {
  type: string;
  config?: Record<string, unknown>;
};

export type Aggregation = string | AggregationObject;

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DateOffset = {
  unit: PeriodType;
  offset?: number;
  modifier?: 'start_of' | 'end_of';
  modifierUnit?: PeriodType;
};

export type DateSpecs = string | DateOffset;

type Transform = string | Record<string, unknown>;

export interface ReportConfig {
  fetch: {
    dataElements?: string[];
    dataGroups?: string[];
    aggregations?: Aggregation[];
    startDate?: DateSpecs;
    endDate?: DateSpecs;
  };
  transform: Transform[];
  output?: Record<string, unknown>;
}

export interface Event {
  event: string;
  eventDate: string;
  orgUnitName: string;
  orgUnit: string;
  dataValues?: Record<string, string | number>;
}
