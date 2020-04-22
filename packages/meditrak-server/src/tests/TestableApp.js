/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import {} from 'dotenv/config'; // Load the environment variables into process.env
import supertest from 'supertest';
import autobind from 'react-autobind';

import { createApp } from '../app';
import { getModels } from './getModels';

export const DEFAULT_API_VERSION = 2;
const getVersionedEndpoint = (endpoint, apiVersion = DEFAULT_API_VERSION) =>
  `/v${apiVersion}/${endpoint}`;

export const getAuthorizationHeader = () => {
  const credentials = `${process.env.CLIENT_USERNAME}:${process.env.CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

export class TestableApp {
  constructor() {
    this.models = getModels();
    this.database = this.models.database;
    this.app = createApp(this.database, this.models);
    autobind(this);
  }

  async authenticate() {
    const headers = { authorization: getAuthorizationHeader() };
    const body = {
      emailAddress: 'test.user@tupaia.org',
      password: 'test.password',
      deviceName: 'Test Device',
      installId: 'TEST-4D1AC092-4A3E-9958-C109DC56051A',
      app_version: '999.999.999',
    };
    const response = await this.post('auth', { headers, body });
    this.authToken = response.body.accessToken;
  }

  get(endpoint, options, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).get(versionedEndpoint), options);
  }

  post(endpoint, options, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).post(versionedEndpoint), options);
  }

  put(endpoint, options, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).put(versionedEndpoint), options);
  }

  addOptionsToRequest(request, { headers, body } = {}) {
    if (this.authToken) {
      request.set('Authorization', `Bearer ${this.authToken}`);
    }
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => request.set(key, value));
    }
    if (body) {
      request.send(body);
    }
    return request;
  }
}
