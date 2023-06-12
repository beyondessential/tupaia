/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

export type QueryParameters = Record<string, string>;

export interface AuthHandler {
  getAuthHeader: () => Promise<string>;
}
