/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { BaseReport, MatrixReport, ViewReport } from '../../models-extra';

export interface Params {
  reportCode: string;
}

export type ResBody = ViewReport | MatrixReport | BaseReport;
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  organisationUnitCode: string;
  projectCode: string;
  startDate: string;
  endDate: string;
}
