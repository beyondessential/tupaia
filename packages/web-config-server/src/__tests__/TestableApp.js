import supertest from 'supertest';
import { util } from 'client-sessions';
import { createApp } from '/app';
import { USER_SESSION_CONFIG } from '/authSession';

export const DEFAULT_API_VERSION = 1;
const getVersionedEndpoint = (endpoint, apiVersion = DEFAULT_API_VERSION) =>
  `/api/v${apiVersion}/${endpoint}`;

const app = createApp();

export class TestableApp {
  constructor() {
    this.app = app;
    this.currentCookies = null;
  }

  async mockSessionUserJson(userName, email, accessPolicy) {
    this.session = util.encode(USER_SESSION_CONFIG, {
      userJson: {
        userName,
        email,
        accessPolicy,
      },
    });
  }

  get(endpoint, options, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).get(versionedEndpoint), options);
  }

  post(endpoint, options, apiVersion = DEFAULT_API_VERSION) {
    const versionedEndpoint = getVersionedEndpoint(endpoint, apiVersion);
    return this.addOptionsToRequest(supertest(this.app).post(versionedEndpoint), options);
  }

  addOptionsToRequest(request, { headers, body } = {}) {
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => request.set(key, value));
    }
    request.set('Cookie', `${USER_SESSION_CONFIG.cookieName}=${this.session}`);
    if (body) {
      request.send(body);
    }
    return request;
  }
}
