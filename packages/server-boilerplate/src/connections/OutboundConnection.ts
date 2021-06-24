/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { fetchWithTimeout, verifyResponseStatus, stringifyQuery } from '@tupaia/utils';
import { QueryParameters } from '../types';
import { RequestBody, FetchConfig } from './types';

export class OutboundConnection {
  public async get(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters = {},
  ) {
    return this.request(authHeader, 'GET', baseUrl, endpoint, queryParameters);
  }

  public async post(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.request(authHeader, 'POST', baseUrl, endpoint, queryParameters, body);
  }

  public async put(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.request(authHeader, 'PUT', baseUrl, endpoint, queryParameters, body);
  }

  public async delete(authHeader: string, baseUrl: string, endpoint: string) {
    return this.request(authHeader, 'DELETE', baseUrl, endpoint);
  }

  private async request(
    authHeader: string,
    requestMethod: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters = {},
    body?: RequestBody,
  ) {
    const queryUrl = stringifyQuery(baseUrl, endpoint, queryParameters);
    const fetchConfig: FetchConfig = {
      method: requestMethod || 'GET',
      headers: {
        Authorization: authHeader,
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
