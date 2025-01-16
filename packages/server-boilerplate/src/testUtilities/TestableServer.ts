// eslint-disable-next-line import/no-extraneous-dependencies
import supertest, { Test } from 'supertest';

import { Express } from 'express';

type RequestOptions = { headers?: Record<string, string>; query?: Record<string, any>; body?: any };

export class TestableServer {
  private readonly app: Express;
  private readonly version: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultQuery: Record<string, string>;

  public constructor(app: Express, version = 1) {
    this.app = app;
    this.version = version;
    this.defaultHeaders = {};
    this.defaultQuery = {};
  }

  private getVersionedEndpoint = (endpoint: string) => `/v${this.version}/${endpoint}`;

  public get(endpoint: string, options: RequestOptions = {}) {
    const versionedEndpoint = this.getVersionedEndpoint(endpoint);
    return this.addOptionsToRequest(supertest(this.app).get(versionedEndpoint), options);
  }

  public post(endpoint: string, options: RequestOptions = {}) {
    const versionedEndpoint = this.getVersionedEndpoint(endpoint);
    return this.addOptionsToRequest(supertest(this.app).post(versionedEndpoint), options);
  }

  public put(endpoint: string, options: RequestOptions = {}) {
    const versionedEndpoint = this.getVersionedEndpoint(endpoint);
    return this.addOptionsToRequest(supertest(this.app).put(versionedEndpoint), options);
  }

  public delete(endpoint: string, options: RequestOptions = {}) {
    const versionedEndpoint = this.getVersionedEndpoint(endpoint);
    return this.addOptionsToRequest(supertest(this.app).delete(versionedEndpoint), options);
  }

  public setDefaultHeader(name: string, value: string) {
    this.defaultHeaders[name] = value;
  }

  public setDefaultQueryParam(name: string, value: string) {
    this.defaultQuery[name] = value;
  }

  private addOptionsToRequest(request: Test, options: RequestOptions = {}) {
    const { headers, query, body } = options;

    Object.entries(this.defaultHeaders).forEach(([key, value]) => request.set(key, value));

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => request.set(key, value));
    }

    if (query) {
      request.query({ ...this.defaultQuery, ...query });
    } else {
      request.query(this.defaultQuery);
    }

    if (body) {
      request.send(body);
    }
    return request;
  }
}
