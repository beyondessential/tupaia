/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export type Params = Record<string, never>;

export interface ResBody {
  name: string;
  entityCode: string;
  entityType: string;
  mapOverlays: any[];
}

export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
