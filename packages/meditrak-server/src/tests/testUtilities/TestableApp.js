/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import {} from 'dotenv/config'; // Load the environment variables into process.env
import supertest from 'supertest';
import autobind from 'react-autobind';
import sinon from 'sinon';

import { Authenticator } from '@tupaia/auth';
import { generateTestId } from '@tupaia/database';

import { BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { createApp } from '../../createApp';
import { getModels } from './database';

const DEFAULT_API_VERSION = 2;
const getVersionedEndpoint = (endpoint, apiVersion = DEFAULT_API_VERSION) =>
  `/v${apiVersion}/${endpoint}`;

export const getAuthorizationHeader = () => {
  const credentials = `${process.env.CLIENT_USERNAME}:${process.env.CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

const translateQuery = query =>
  query?.filter ? { ...query, filter: JSON.stringify(query?.filter) } : query;

export class TestableApp {
  constructor() {
    this.models = getModels();

    this.database = this.models.database;
    this.database.generateId = generateTestId;

    this.app = createApp(this.database, this.models);
    this.user = {};
    autobind(this);
  }

  async grantFullAccess() {
    const policy = {
      DL: [BES_ADMIN_PERMISSION_GROUP],
    };
    return this.grantAccess(policy);
  }

  async grantAccess(policy) {
    sinon.stub(Authenticator.prototype, 'getAccessPolicyForUser').resolves(policy);
    return this.authenticate();
  }

  revokeAccess() {
    Authenticator.prototype.getAccessPolicyForUser.restore();
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

    this.user = response.body.user;
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

  delete(endpoint, options, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).delete(versionedEndpoint), options);
  }

  addOptionsToRequest(request, { headers, query, body } = {}) {
    if (this.authToken) {
      request.set('Authorization', `Bearer ${this.authToken}`);
    }
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => request.set(key, value));
    }
    if (query) {
      request.query(translateQuery(query));
    }
    if (body) {
      request.send(body);
    }
    return request;
  }
}
