import { ParamsDictionary, Query } from 'express-serve-static-core';

export interface FetchReportQuery extends Query {
  organisationUnitCode: string;
  period?: string;
}

export interface FetchReportParams extends ParamsDictionary {
  reportCode: string;
}
