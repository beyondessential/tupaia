/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CacheContainer } from 'node-ts-cache';
import { MemoryStorage } from 'node-ts-cache-storage-memory';

import { OutboundConnection } from './OutboundConnection';
import { QueryParameters } from '../types';
import { RequestBody } from './types';

export class CachedOutboundConnection extends OutboundConnection {
  private readonly cache: CacheContainer;
  private readonly ttl: number;

  /**
   *
   * @param ttl Time to live for cache entries in milliseconds, default 30 seconds
   */
  constructor(ttl: number = 30000) {
    super();
    this.cache = new CacheContainer(new MemoryStorage());
    this.ttl = ttl;
  }

  private getCacheKey = (method: string, functionArguments: any) =>
    `${method}:${JSON.stringify(Object.values(functionArguments))}`;

  private async cachedFetch(cacheKey: string, cacheFn: () => Promise<any>) {
    const cachedValue = await this.cache.getItem(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }

    const valuePromise = cacheFn();
    this.cache.setItem(cacheKey, cacheFn, { ttl: this.ttl });
    return valuePromise;
  }

  public async get(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters = {},
  ) {
    return this.cachedFetch(this.getCacheKey('get', arguments), () =>
      super.get(authHeader, baseUrl, endpoint, queryParameters),
    );
  }

  public async post(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.cachedFetch(this.getCacheKey('post', arguments), () =>
      super.post(authHeader, baseUrl, endpoint, queryParameters, body),
    );
  }

  public async put(
    authHeader: string,
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.cachedFetch(this.getCacheKey('put', arguments), () =>
      super.put(authHeader, baseUrl, endpoint, queryParameters, body),
    );
  }

  public async delete(authHeader: string, baseUrl: string, endpoint: string) {
    return this.cachedFetch(this.getCacheKey('delete', arguments), () =>
      super.delete(authHeader, baseUrl, endpoint),
    );
  }
}
