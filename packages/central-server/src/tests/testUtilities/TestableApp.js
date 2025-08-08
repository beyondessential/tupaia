import supertest from 'supertest';
import autobind from 'react-autobind';
import sinon from 'sinon';

import { Authenticator } from '@tupaia/auth';
import { generateId } from '@tupaia/database';
import { createBasicHeader, createBearerHeader } from '@tupaia/utils';

import { BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { createApp } from '../../createApp';
import { getModels } from './database';
import { TEST_API_USER_EMAIL, TEST_API_USER_PASSWORD, TEST_USER_EMAIL } from './constants';
import { configureEnv } from '../../configureEnv';

configureEnv();

const DEFAULT_API_VERSION = 2;
const getVersionedEndpoint = (endpoint, apiVersion = DEFAULT_API_VERSION) =>
  `/v${apiVersion}/${endpoint}`;

export const getAuthorizationHeader = () => {
  return createBasicHeader(TEST_API_USER_EMAIL, TEST_API_USER_PASSWORD);
};

const translateQuery = query =>
  query?.filter ? { ...query, filter: JSON.stringify(query?.filter) } : query;

export class TestableApp {
  constructor() {
    this.models = getModels();

    this.database = this.models.database;
    this.database.generateId = generateId;

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
      emailAddress: TEST_USER_EMAIL,
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

  multipartPost({ endpoint, filesByMultipartKey, payload, headers, query, apiVersion }) {
    return this.multipart({
      method: 'post',
      endpoint,
      filesByMultipartKey,
      payload,
      headers,
      query,
      apiVersion,
    });
  }

  multipartPut({ endpoint, filesByMultipartKey, payload, headers, query, apiVersion }) {
    return this.multipart({
      method: 'put',
      endpoint,
      filesByMultipartKey,
      payload,
      headers,
      query,
      apiVersion,
    });
  }

  /**
   * @param {'put' | 'post'} method
   * @param {string} endpoint
   * @param {[key:string]: string} filesByMultipartKey map of fieldname -> file path
   * @param {} [queryParameters]
   * @param {} [payload] The part which is not a file. Sent as JSON with fieldname `payload`
   */
  multipart({
    method,
    endpoint,
    filesByMultipartKey = {},
    payload = {},
    headers,
    query,
    apiVersion = DEFAULT_API_VERSION,
  }) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    let req = supertest(this.app);
    if (method === 'put') {
      req = req.put(versionedEndpoint);
    } else if (method === 'post') {
      req = req.post(versionedEndpoint);
    }
    req = req.field('payload', JSON.stringify(payload));
    for (const [fieldname, file] of Object.entries(filesByMultipartKey)) {
      req = req.attach(fieldname, file);
    }
    return this.addOptionsToRequest(req, { headers, query });
  }

  delete(endpoint, options, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).delete(versionedEndpoint), options);
  }

  addOptionsToRequest(request, { headers, query, body } = {}) {
    if (this.authToken) {
      request.set('Authorization', createBearerHeader(this.authToken));
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
