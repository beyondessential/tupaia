/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export interface Context {
  query?: Record<string, unknown>;
  orgUnits?: { code: string; name: string; id: string; attributes: Record<string, any> }[];
  facilityCountByOrgUnit?: Record<string, number>; // { TO: 14, PG: 9 }
  dataElementCodeToName?: Record<string, string>;
}

export type ContextDependency = Exclude<keyof Context, 'query'>;
