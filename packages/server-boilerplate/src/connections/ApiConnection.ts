/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { QueryParameters } from '../types';
import { AuthHandler, RequestBody } from './types';
import { OutboundConnection } from './OutboundConnection';

export class ApiConnection {
  authHandler: AuthHandler;

  baseUrl!: string;

  private readonly outboundConnection: OutboundConnection;

  constructor(authHandler: AuthHandler) {
    this.authHandler = authHandler;
    this.outboundConnection = new OutboundConnection();
  }

  async get(endpoint: string, queryParameters: QueryParameters = {}) {
    return this.outboundConnection.get(
      await this.authHandler.getAuthHeader(),
      this.baseUrl,
      endpoint,
      queryParameters,
    );
  }

  async post(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.outboundConnection.post(
      await this.authHandler.getAuthHeader(),
      this.baseUrl,
      endpoint,
      queryParameters,
      body,
    );
  }

  async put(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.outboundConnection.put(
      await this.authHandler.getAuthHeader(),
      this.baseUrl,
      endpoint,
      queryParameters,
      body,
    );
  }

  async delete(endpoint: string) {
    return this.outboundConnection.delete(
      await this.authHandler.getAuthHeader(),
      this.baseUrl,
      endpoint,
    );
  }
}
