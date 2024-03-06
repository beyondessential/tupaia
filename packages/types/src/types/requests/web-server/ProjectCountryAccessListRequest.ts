/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Params {
  projectCode: string;
}

interface CountryAccessObject {
  id: string;
  name: string;
  hasAccess: boolean;
  hasPendingAccess: boolean;
}
export type ResBody = CountryAccessObject[];

export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
