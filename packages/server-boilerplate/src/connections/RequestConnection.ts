/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { QueryParameters } from '../types';
import { AuthHandler, RequestBody } from './types';
import { OutboundConnection } from './OutboundConnection';

export class RequestConnection {
  authHandler: AuthHandler;

  private readonly outboundConnection: OutboundConnection;

  constructor(authHandler: AuthHandler) {
    this.authHandler = authHandler;
    this.outboundConnection = new OutboundConnection();
  }

  async get(baseUrl: string, endpoint: string, queryParameters: QueryParameters = {}) {
    return this.outboundConnection.get(
      await this.authHandler.getAuthHeader(),
      baseUrl,
      endpoint,
      queryParameters,
    );
  }

  async post(
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.outboundConnection.post(
      await this.authHandler.getAuthHeader(),
      baseUrl,
      endpoint,
      queryParameters,
      body,
    );
  }

  async put(
    baseUrl: string,
    endpoint: string,
    queryParameters: QueryParameters,
    body: RequestBody,
  ) {
    return this.outboundConnection.put(
      await this.authHandler.getAuthHeader(),
      baseUrl,
      endpoint,
      queryParameters,
      body,
    );
  }

  async delete(baseUrl: string, endpoint: string) {
    return this.outboundConnection.delete(
      await this.authHandler.getAuthHeader(),
      baseUrl,
      endpoint,
    );
  }
}
