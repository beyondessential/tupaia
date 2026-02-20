import type { Response as ExpressResponse } from 'express';
import type { HeadersInit, RequestInit, Response } from 'node-fetch';
import nodeFetch, { Headers } from 'node-fetch';
import { stringify } from 'qs';

import { CustomError } from '@tupaia/utils';
import { AuthHandler, QueryParameters } from '../types';

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

interface FetchHeaders {
  Authorization: string;
  'Content-Type'?: string;
  'X-Client-Version'?: string;
}

type FetchConfig = RequestInit & {
  headers: HeadersInit & FetchHeaders;
};

const DEFAULT_MAX_WAIT_TIME = 120_000; // 120 seconds

export interface ApiConnectionOptions {
  /** Optional headers to send with every API request */
  headers?: { 'X-Client-Version'?: string };
}

export class ApiConnection {
  private readonly authHandler: AuthHandler;

  private readonly baseUrl: string;

  private readonly headerOverrides?: Headers;

  public constructor(
    authHandler: AuthHandler,
    baseUrl: string,
    options: ApiConnectionOptions = {},
  ) {
    this.authHandler = authHandler;
    this.baseUrl = baseUrl;
    this.headerOverrides = new Headers(options.headers);
  }

  public async get(endpoint: string, queryParameters?: QueryParameters | null) {
    return this.request('GET', endpoint, queryParameters);
  }

  public async post(
    endpoint: string,
    queryParameters?: QueryParameters | null,
    body?: RequestBody | null,
  ) {
    return this.request('POST', endpoint, queryParameters, body);
  }

  public async put(
    endpoint: string,
    queryParameters?: QueryParameters | null,
    body?: RequestBody | null,
  ) {
    return this.request('PUT', endpoint, queryParameters, body);
  }

  public async delete(endpoint: string, queryParameters?: QueryParameters | null) {
    return this.request('DELETE', endpoint, queryParameters);
  }

  public async pipeStream(
    response: ExpressResponse,
    endpoint: string,
    queryParameters?: QueryParameters | null,
  ) {
    const fetchedResponse = await this.fetchResponse('GET', endpoint, queryParameters);
    return fetchedResponse.body.pipe(response);
  }

  private async fetchResponse(
    requestMethod: string,
    endpoint: string,
    queryParameters?: QueryParameters | null,
    body?: RequestBody | null,
  ) {
    const queryUrl = this.stringifyQuery(this.baseUrl, endpoint, queryParameters || {});
    const fetchConfig: FetchConfig = {
      method: requestMethod || 'GET',
      headers: {
        Authorization: await this.authHandler.getAuthHeader(),
        'Content-Type': 'application/json',
        ...this.headerOverrides?.raw(),
      },
    };
    if (body) {
      fetchConfig.body = JSON.stringify(body);
    }

    return this.fetchWithTimeout(queryUrl, fetchConfig);
  }

  private async request(
    requestMethod: string,
    endpoint: string,
    queryParameters?: QueryParameters | null,
    body?: RequestBody | null,
  ) {
    const response = await this.fetchResponse(requestMethod, endpoint, queryParameters, body);

    await this.verifyResponse(response);

    const contentType = response.headers.get('content-type');
    if (contentType?.startsWith('application/json')) {
      return response.json();
    }
    // If the content isn't json we expect the receiving code to parse it

    return response;
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestInit,
    timeout: number = DEFAULT_MAX_WAIT_TIME,
  ): Promise<Response> {
    return nodeFetch(url, { ...config, timeout });
  }

  private async verifyResponse(response: Response): Promise<void> {
    if (response.ok) return;

    const contentType = response.headers.get('content-type');
    if (contentType?.startsWith('application/json')) {
      const responseJson = await response.json();
      throw new CustomError(
        {
          responseText: `API error ${response.status}: ${
            responseJson.error || responseJson.message
          }`,
          responseStatus: response.status,
        },
        {},
      );
    }
    if (contentType?.startsWith('text/html')) {
      throw new CustomError(
        {
          responseStatus: response.status,
          responseText: `${response.statusText}: Expected application/json but got ${contentType}`,
        },
        { responseBody: await response.text() },
      );
    }
  }

  private stringifyQuery(baseUrl = '', endpoint: string, queryParams: QueryParameters): string {
    const urlAndEndpoint = baseUrl ? `${baseUrl}/${endpoint}` : endpoint;

    const queryString = stringify(queryParams);

    return queryString ? `${urlAndEndpoint}?${queryString}` : `${urlAndEndpoint}`;
  }
}
