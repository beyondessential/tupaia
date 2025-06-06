import nodeFetch from 'node-fetch';
import type { RequestInit, HeadersInit, Response } from 'node-fetch';
import { stringify } from 'qs';
import { CustomError, RespondingError } from '@tupaia/utils';
import { QueryParameters, AuthHandler } from '../types';

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

type FetchHeaders = HeadersInit & {
  Authorization: string;
  'Content-Type'?: string;
};

type FetchConfig = RequestInit & {
  headers: FetchHeaders;
};

const DEFAULT_MAX_WAIT_TIME = 120 * 1000; // 120 seconds in milliseconds

export class ApiConnection {
  private readonly authHandler: AuthHandler;

  private readonly baseUrl: string;

  public constructor(authHandler: AuthHandler, baseUrl: string) {
    this.authHandler = authHandler;
    this.baseUrl = baseUrl;
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

  private async request(
    requestMethod: string,
    endpoint: string,
    queryParameters?: QueryParameters | null,
    body?: RequestBody | null,
  ) {
    const tic = performance.now();
    const queryUrl = this.stringifyQuery(this.baseUrl, endpoint, queryParameters || {});
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

    console.debug(`\n[ApiConnection#request] fetching with timeout`, decodeURI(queryUrl));
    const response = await this.fetchWithTimeout(queryUrl, fetchConfig);
    console.debug(`[ApiConnection#request] fetched`, decodeURI(queryUrl).substring(0, 60));

    await this.verifyResponse(response);
    console.debug(`[ApiConnection#request] response verified`);
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const toc = performance.now();
      console.debug(`[ApiConnection#request] responding with JSON after ${toc - tic} ms`);
      return response.json();
    }
    const toc = performance.now();
    // If the content isn't json we expect the receiving code to parse it
    console.debug(`[ApiConnection#request] returning response object after ${toc - tic} ms`);
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
    console.debug(`[ApiConnection#verifyResponse] verifying response`);
    console.debug(`[ApiConnection#verifyResponse]   URL   `, response.url);
    console.debug(`[ApiConnection#verifyResponse]   status`, response.status, response.statusText);
    console.debug(`[ApiConnection#verifyResponse]   size  `, response.size);
    console.debug(
      `[ApiConnection#verifyResponse]   content-type`,
      response.headers.get('content-type'),
    );

    if (!response.ok) {
      console.debug(`[ApiConnection]   not OK`);
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
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

      if (contentType?.includes('text/')) {
        const responseText = await response.text();
        throw new RespondingError(
          `Expected application/json response but received ${contentType}`,
          response.status,
          { responseText },
        );
      }
    }
  }

  private stringifyQuery(baseUrl = '', endpoint: string, queryParams: QueryParameters): string {
    const urlAndEndpoint = baseUrl ? `${baseUrl}/${endpoint}` : endpoint;

    const queryString = stringify(queryParams);

    return queryString ? `${urlAndEndpoint}?${queryString}` : `${urlAndEndpoint}`;
  }
}
