/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export type Params = Record<string, never>;
export interface ResBody {
  userName?: string;
  email?: string;
  project?: {
    id: string;
    code: string;
    name: string;
    homeEntityCode: string;
    dashboardGroupName: string;
  };
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
