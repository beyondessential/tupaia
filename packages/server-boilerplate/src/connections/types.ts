/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/**
 * @deprecated use @tupaia/api-client
 */
export interface MicroserviceApi {
  baseUrl: string;
}

/**
 * @deprecated use @tupaia/api-client
 */
export interface AuthHandler {
  email?: string;
  getAuthHeader: () => Promise<string>;
}

/**
 * @deprecated use @tupaia/api-client
 */
export type RequestBody = Record<string, unknown> | Record<string, unknown>[];
