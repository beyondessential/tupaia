/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export interface AuthHandler {
  email?: string;
  getAuthHeader: () => Promise<string>;
}

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export interface FetchHeaders {
  Authorization: string;
  'Content-Type'?: string;
}

export interface FetchConfig {
  method: string;
  headers: FetchHeaders;
  body?: string;
}
