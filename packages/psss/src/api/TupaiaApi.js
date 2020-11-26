/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
// Cypress does not currently support fetch api,
// so have added this polyfill so that cypress requests fall back to xhr
// https://docs.cypress.io/guides/guides/network-requests.html#Testing-Strategies
import 'whatwg-fetch';
import { verifyResponseStatus, stringifyQuery } from '@tupaia/utils';
import {
  getAccessToken,
  getRefreshToken,
  loginSuccess,
  loginError,
  getEntitiesAllowed,
} from '../store';

const [CLIENT_BASIC_AUTH_HEADER, PSSS_API_URL] = [
  process.env.REACT_APP_CLIENT_BASIC_AUTH_HEADER,
  process.env.REACT_APP_PSSS_API_URL,
];
const AUTH_API_ENDPOINT = 'auth';
const FETCH_TIMEOUT = 45 * 1000; // 45 seconds in milliseconds

export class TupaiaApi {
  constructor() {
    this.store = null; // Redux store for keeping state, will be injected after creation
  }

  injectReduxStore(store) {
    this.store = store;
  }

  dispatch(action) {
    this.store.dispatch(action);
  }

  getBearerAuthHeader() {
    return `Bearer ${this.getAccessToken()}`;
  }

  getAccessToken() {
    return getAccessToken(this.store.getState());
  }

  getRefreshToken() {
    return getRefreshToken(this.store.getState());
  }

  async reauthenticate(loginCredentials) {
    const response = await this.post(
      AUTH_API_ENDPOINT,
      null,
      loginCredentials,
      CLIENT_BASIC_AUTH_HEADER,
      false,
    );
    const { body: authenticationDetails } = response;
    const { accessToken, refreshToken, user } = authenticationDetails;
    if (!accessToken || !refreshToken || !user) {
      throw new Error('Invalid response from auth server');
    }

    const entitiesAllowed = getEntitiesAllowed({ auth: { user } });
    if (entitiesAllowed.length === 0) {
      throw new Error(
        'Your permissions for Tupaia do not allow you to view the Pacific Syndromic Surveillance System',
      );
    }
    return authenticationDetails;
  }

  async refreshAccessToken() {
    if (!this.getRefreshToken()) return;
    let response = { body: {} };
    try {
      response = await this.post(
        AUTH_API_ENDPOINT,
        {
          grantType: 'refresh_token',
        },
        {
          refreshToken: this.getRefreshToken(),
        },
        CLIENT_BASIC_AUTH_HEADER,
        false,
      );
      if (!response.body.accessToken) {
        throw new Error('Failed to renew authentication session');
      }
    } catch (error) {
      this.dispatch(loginError(error.message)); // Log the user out if refresh failed
      return; // Silently swallow network errors etc, they will be picked up by the outer request
    }
    this.dispatch(loginSuccess(response.body));
  }

  get(endpoint, queryParameters) {
    return this.requestJson(endpoint, queryParameters, this.buildFetchConfig('GET'));
  }

  post(endpoint, queryParameters, body, authHeader, ...otherParams) {
    const fetchConfig = this.buildFetchConfig('POST', authHeader, body);
    return this.requestJson(endpoint, queryParameters, fetchConfig, ...otherParams);
  }

  put(endpoint, queryParameters, body, authHeader, ...otherParams) {
    const fetchConfig = this.buildFetchConfig('PUT', authHeader, body);
    return this.requestJson(endpoint, queryParameters, fetchConfig, ...otherParams);
  }

  delete(endpoint) {
    const fetchConfig = this.buildFetchConfig('DELETE');
    return this.requestJson(endpoint, null, fetchConfig);
  }

  /*--
  async download(endpoint, queryParameters, fileName) {
    const response = await this.request(endpoint, queryParameters, this.buildFetchConfig('GET'));
    const responseBlob = await response.blob();
    saveAs(responseBlob, fileName);
  }
  */

  upload(endpoint, fileName, file, queryParameters) {
    const body = new FormData();
    body.append(fileName, file);
    const fetchConfig = this.buildFetchConfig('POST', null, body, false);
    return this.requestJson(endpoint, queryParameters, fetchConfig);
  }

  async requestJson(...params) {
    const response = await this.request(...params);
    const responseJson = await response.json();
    return {
      headers: response.headers,
      body: responseJson,
    };
  }

  async request(endpoint, queryParameters, fetchConfig, shouldReauthenticateIfUnauthorized = true) {
    const queryUrl = stringifyQuery(PSSS_API_URL, endpoint, queryParameters);

    const response = await Promise.race([fetch(queryUrl, fetchConfig), createTimeoutPromise()]);
    // If server responded with 401, i.e. not authenticated, refresh token and try once more
    if (
      shouldReauthenticateIfUnauthorized &&
      response.status === 401 &&
      this.getRefreshToken() !== null
    ) {
      try {
        await this.refreshAccessToken();
        const newFetchConfig = fetchConfig;
        newFetchConfig.headers.Authorization = this.getBearerAuthHeader();
        return this.request(endpoint, queryParameters, newFetchConfig, false);
      } catch (error) {
        throw error;
      }
    }
    await verifyResponseStatus(response);
    return response;
  }

  buildFetchConfig(requestMethod, authHeader, body, isJson = true) {
    const fetchConfig = {
      method: requestMethod || 'GET',
      headers: {
        Authorization: authHeader || this.getBearerAuthHeader(),
      },
    };
    if (isJson) {
      fetchConfig.headers['Content-Type'] = 'application/json';
    }
    if (body) {
      fetchConfig.body =
        typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
    }
    return fetchConfig;
  }
}

// Create a promise that rejects after the request has taken too long
const createTimeoutPromise = () =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject({ message: 'Network request timed out' });
    }, FETCH_TIMEOUT);
  });
