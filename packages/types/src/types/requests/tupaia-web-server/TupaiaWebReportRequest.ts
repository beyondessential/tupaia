/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { EmptyRequestBody } from './defaults';

interface ReportRequestParams {
  reportCode: string;
}

interface ReportRequestResponse {
  data: Record<string, unknown>[];
  startDate: string;
  endDate: string;
}

interface ReportRequestQuery {
  organisationUnitCode: string;
  projectCode: string;
  startDate: string;
  endDate: string;
}

export type TupaiaWebReportRequest<
  Params = ReportRequestParams,
  ResBody = ReportRequestResponse,
  ReqBody = EmptyRequestBody,
  ReqQuery = ReportRequestQuery
> = Request<Params, ResBody, ReqBody, ReqQuery>;
