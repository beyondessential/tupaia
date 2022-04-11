/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import * as dotenv from 'dotenv';

/**
 * Start the server
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest, { Test } from 'supertest';

import { Express } from 'express';

import { Authenticator } from '@tupaia/auth';
import { getTestDatabase } from '@tupaia/database';

import { createApp } from '../../app';

dotenv.config(); // Load the environment variables into process.env

export const PUBLIC_PERMISSION_GROUP = 'Public';
const DEFAULT_API_VERSION = 1;
const getVersionedEndpoint = (endpoint: string, apiVersion = DEFAULT_API_VERSION) =>
  `/v${apiVersion}/${endpoint}`;

export const getAuthorizationHeader = () => {
  const credentials = `${process.env.CLIENT_USERNAME}:${process.env.CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

type RequestOptions = { headers?: Record<string, any>; query?: Record<string, any>; body?: any };

export class TestableEntityServer {
  private readonly app: Express;
  private readonly email: string;
  private readonly password: string;

  public constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.app = createApp(getTestDatabase());
  }

  public grantAccessToCountries(countries: string[]) {
    const policy = Object.fromEntries(
      countries.map(country => [country, [PUBLIC_PERMISSION_GROUP]]),
    );
    return this.grantAccess(policy);
  }

  private grantAccess(policy: Record<string, string[]>) {
    jest
      .spyOn(Authenticator.prototype, 'getAccessPolicyForUser')
      .mockImplementation(async () => policy);
  }

  public revokeAccess() {
    jest.restoreAllMocks();
  }

  public get(endpoint: string, options: RequestOptions = {}, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).get(versionedEndpoint), options);
  }

  public post(endpoint: string, options: RequestOptions = {}, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).post(versionedEndpoint), options);
  }

  public put(endpoint: string, options: RequestOptions = {}, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).put(versionedEndpoint), options);
  }

  public delete(endpoint: string, options: RequestOptions = {}, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).delete(versionedEndpoint), options);
  }

  private addOptionsToRequest(request: Test, options: RequestOptions = {}) {
    const { headers, query, body } = options;
    request.set(
      'Authorization',
      `Basic ${Buffer.from(`${this.email}:${this.password}`).toString('base64')}`,
    );

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => request.set(key, value));
    }

    if (query) {
      request.query(query);
    }

    if (body) {
      request.send(body);
    }
    return request;
  }
}
