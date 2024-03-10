/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export type Params = Record<string, never>;

interface CountryAccess {
  id: string;
  name: string;
  hasAccess: boolean;
  accessRequests: string[];
}
export type ResBody = CountryAccess[];

export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
