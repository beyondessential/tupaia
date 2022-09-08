/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { TupaiaApiClient } from '@tupaia/api-client';
import { ReportModel } from './models';
import type { DateSpecs } from './reportBuilder';

export type RequestContext = {
  services: TupaiaApiClient;
};

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

export interface EventMetaData {
  code: string;
  name: string;
  dataElements: { code: string; name: string; text: string }[];
}

export interface AggregationType {
  code: string;
  description: string;
}

export interface TransformSchema {
  code: string;
  alias?: boolean;
  string?: Record<string, string | boolean | string[]> | null;
}
