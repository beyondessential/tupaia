/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import nodeFetch from 'node-fetch';
import type { RequestInit, HeadersInit, Response } from 'node-fetch';
import { stringify } from 'qs';
import { QueryParameters, AuthHandler } from '../types';

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

type FetchHeaders = HeadersInit & {
  Authorization: string;
  'Content-Type'?: string;
};

type FetchConfig = RequestInit & {
  headers: FetchHeaders;
};

const DEFAULT_MAX_WAIT_TIME = 45 * 1000; // 45 seconds in milliseconds

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

  public async delete(endpoint: string) {
    return this.request('DELETE', endpoint);
  }

  private async request(
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
      },
    };
    if (body) {
      fetchConfig.body = JSON.stringify(body);
    }

    const response = await this.fetchWithTimeout(queryUrl, fetchConfig);
    await this.verifyResponse(response);
    return response.json();
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestInit,
    timeout: number = DEFAULT_MAX_WAIT_TIME,
  ): Promise<Response> {
    return nodeFetch(url, { ...config, timeout });
  }

  private async verifyResponse(response: Response): Promise<void> {
    if (!response.ok) {
      const responseJson = await response.json();
      if (
        response.status &&
        (response.status < 200 || response.status >= 300) &&
        !responseJson.error
      ) {
        throw new Error(`API error ${response.status}: ${responseJson.message}`);
      }
      if (responseJson.error) {
        throw new Error(`API error ${response.status}: ${responseJson.error}`);
      }
    }
  }

  private stringifyQuery(baseUrl = '', endpoint: string, queryParams: QueryParameters): string {
    const urlAndEndpoint = baseUrl ? `${baseUrl}/${endpoint}` : endpoint;

    const queryString = stringify(queryParams);

    return queryString ? `${urlAndEndpoint}?${queryString}` : `${urlAndEndpoint}`;
  }
}
