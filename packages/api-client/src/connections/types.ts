/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export interface MicroserviceApi {
  baseUrl: string;
}

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];
