/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Params {
  rootEntityCode: string;
  projectCode: string;
}

export type ResBody = Record<string, never>;
export type ReqBody = Record<string, never>;

export interface ReqQuery {
  fields?: string[];
  filter?: Record<string, string | { comparator: string; comparisonValue: any }>;
}
