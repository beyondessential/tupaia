/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { fetchWithTimeout, verifyResponseStatus, stringifyQuery } from '@tupaia/utils';
import { QueryParameters } from '../types';
import { AuthHandler } from './types';

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

export class ApiConnection {
  public authHandler: AuthHandler;

  public baseUrl!: string;

  constructor(authHandler: AuthHandler) {
    this.authHandler = authHandler;
  }

  async get(endpoint: string, queryParameters: QueryParameters = {}) {
    return this.request('GET', endpoint, queryParameters);
  }

  async post(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.request('POST', endpoint, queryParameters, body);
  }

  async put(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.request('PUT', endpoint, queryParameters, body);
  }

  async delete(endpoint: string) {
    return this.request('DELETE', endpoint);
  }

  private async request(
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
