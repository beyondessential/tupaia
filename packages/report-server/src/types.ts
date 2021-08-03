/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { ReportModel } from './models';

export interface ReportServerModelRegistry extends ModelRegistry {
  readonly report: ReportModel;
}

export interface FetchReportQuery {
  organisationUnitCodes: string[];
  hierarchy?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportConfig {
  fetch: {
    dataElements?: string[];
    dataGroups?: string[];
    aggregations?: (string | Record<string, unknown>)[];
  };
  transform: (string | Record<string, unknown>)[];
  output?: Record<string, unknown>[];
}

export interface Event {
  event: string;
  eventDate: string;
  orgUnitName: string;
  orgUnit: string;
  dataValues?: Record<string, string | number>;
}

export type AggregationObject = { type: string; config: Record<string, string> };
