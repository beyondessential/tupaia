/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { fetchWithTimeout, verifyResponseStatus, stringifyQuery } from '@tupaia/utils';

type QueryParameters = Record<string, string>;
type RequestBody = Record<string, unknown> | Record<string, unknown>[];
interface FetchHeaders {
  Authorization: string;
  'Content-Type'?: string;
}

interface FetchConfig {
  method: string;
  headers: FetchHeaders;
  body?: string;
}

export interface AuthHandler {
  email?: string;
  getAuthHeader: () => Promise<string>;
}

export class ApiConnection {
  authHandler: AuthHandler;

  baseUrl!: string;

  constructor(authHandler: AuthHandler) {
    this.authHandler = authHandler;
  }

  get(endpoint: string, queryParameters: QueryParameters = {}) {
    return this.request('GET', endpoint, queryParameters);
  }

  post(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.request('POST', endpoint, queryParameters, body);
  }

  put(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.request('PUT', endpoint, queryParameters, body);
  }

  delete(endpoint: string) {
    return this.request('DELETE', endpoint);
  }

  async request(
    requestMethod: string,
    endpoint: string,
    queryParameters: QueryParameters = {},
    body?: RequestBody,
  ) {
    const queryUrl = stringifyQuery(this.baseUrl, endpoint, queryParameters);
    const fetchConfig: FetchConfig = {
      method: requestMethod || 'GET',
      headers: {
        Authorization: await this.authHandler.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      fetchConfig.body = JSON.stringify(body);
    }

    const response = await fetchWithTimeout(queryUrl, fetchConfig);
    await verifyResponseStatus(response);
    return response.json();
  }
}
