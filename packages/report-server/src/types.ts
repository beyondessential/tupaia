/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator } from '@tupaia/auth';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';

export interface FetchReportQuery extends Query {
  organisationUnitCodes: string;
  period?: string;
}

export interface FetchReportParams extends ParamsDictionary {
  reportCode: string;
}

export interface ReportConfig {
  fetch: {
    dataElements?: string[];
    dataGroups?: string[];
  };
  transform: (string | Record<string, unknown>)[];
}

interface ReportsRequestBody {
  emailAddress: string;
  password: string;
  testConfig?: ReportConfig;
  testData?: Record<string, string | number | boolean>[];
}

export interface ReportsRequest<
  P = FetchReportParams,
  ResBody = unknown,
  ReqBody = ReportsRequestBody,
  ReqQuery = FetchReportQuery
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  accessPolicy: AccessPolicy;
  authenticator: Authenticator;
  database: TupaiaDatabase;
  models: ModelRegistry;
}

export interface Event {
  event: string;
  eventDate: string;
  orgUnitName: string;
  orgUnit: string;
  dataValues?: {
    [key: string]: string | number;
  };
}
