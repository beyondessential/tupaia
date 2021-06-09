/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';

export interface FetchReportFilter {
  organisationUnitCodes: string;
  hierarchy?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export interface FetchReportQuery extends Query, FetchReportFilter {}

interface ReportsRequestBody extends FetchReportFilter {
  testConfig?: ReportConfig;
  testData?: Record<string, string | number>[];
}

interface FetchReportUrlParams extends ParamsDictionary {
  reportCode: string;
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

export interface ReportsRequest<
  P = FetchReportUrlParams,
  ResBody = unknown,
  ReqBody = ReportsRequestBody,
  ReqQuery = FetchReportQuery
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  accessPolicy: AccessPolicy;
  database: TupaiaDatabase;
  models: ModelRegistry;
}

export interface Event {
  event: string;
  eventDate: string;
  orgUnitName: string;
  orgUnit: string;
  dataValues?: Record<string, string | number>;
}

export type AggregationObject = { type: string; config: Record<string, string> };
