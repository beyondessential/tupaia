/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Params {
  reportCode: string;
}

export interface ResBody {
  data: Record<string, unknown>[];
  startDate: string;
  endDate: string;
}

export type ReqBody = Record<string, never>;

export interface ReqQuery {
  organisationUnitCode: string;
  projectCode: string;
  startDate: string;
  endDate: string;
}
