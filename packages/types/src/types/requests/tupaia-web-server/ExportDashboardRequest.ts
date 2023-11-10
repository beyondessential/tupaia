/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Params {
  projectCode: string;
  entityCode: string;
  dashboardName: string;
}
export interface ResBody {
  contents: Buffer;
  filePath?: string;
  type: string;
}
export type ReqBody = {
  cookieDomain: string;
  baseUrl: string;
  selectedDashboardItems?: string[];
};
export type ReqQuery = Record<string, string>;
