/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { fetchWithTimeout, verifyResponseStatus, stringifyQuery } from '@tupaia/utils';

import { QueryParameters, RequestBody } from '../types';
import { AuthHandler } from './types';

type CustomHeaders = {
  'x-forwarded-for'?: string;
};

/**
 * @deprecated use @tupaia/api-client
 */
export class ApiConnection {
  public authHandler: AuthHandler;
  public baseUrl!: string;

  public constructor(authHandler: AuthHandler) {
    this.authHandler = authHandler;
  }

  protected async get(endpoint: string, queryParameters: QueryParameters = {}) {
    return this.request('GET', endpoint, queryParameters);
  }

  protected async post(
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
    headers: CustomHeaders = {},
  ) {
    return this.request('POST', endpoint, queryParameters, body, headers);
  }

  protected async put(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.request('PUT', endpoint, queryParameters, body);
  }

  protected async delete(endpoint: string) {
    return this.request('DELETE', endpoint);
  }

  private async request(
    requestMethod: string,
    endpoint: string,
    queryParameters: QueryParameters = {},
    body?: RequestBody,
    headers: CustomHeaders = {},
  ) {
    const queryUrl = stringifyQuery(this.baseUrl, endpoint, queryParameters);
    const fetchConfig: RequestInit = {
      method: requestMethod || 'GET',
      headers: {
        Authorization: await this.authHandler.getAuthHeader(),
        'Content-Type': 'application/json',
        ...headers,
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
