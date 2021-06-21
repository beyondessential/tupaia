/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { fetchWithTimeout, verifyResponseStatus, stringifyQuery } from '@tupaia/utils';
import { QueryParameters } from '../types';
import { RequestBody } from './types';

interface FetchHeaders {
  Authorization: string;
  'Content-Type'?: string;
}

interface FetchConfig {
  method: string;
  headers: FetchHeaders;
  body?: string;
}

export class OutboundConnection {
  get(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters = {},
  ) {
    return this.request(authHeader, 'GET', baseUrl, endpoint, queryParameters);
  }

  post(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.request(authHeader, 'POST', baseUrl, endpoint, queryParameters, body);
  }

  put(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.request(authHeader, 'PUT', baseUrl, endpoint, queryParameters, body);
  }

  delete(authHeader: string, baseUrl: string, endpoint: string) {
    return this.request(authHeader, 'DELETE', baseUrl, endpoint);
  }

  async request(
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
