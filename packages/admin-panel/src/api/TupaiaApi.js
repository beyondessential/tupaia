/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { saveAs } from 'file-saver';

import { verifyResponseStatus, stringifyQuery } from '@tupaia/utils';

const FETCH_TIMEOUT = 45 * 1000; // 45 seconds in milliseconds

export class TupaiaApi {
  async login(loginCredentials) {
    const { body: authenticationDetails } = await this.post(
      'login',
      null,
      loginCredentials,
      process.env.REACT_APP_CLIENT_BASIC_AUTH_HEADER,
    );
    return authenticationDetails;
  }

  async logout() {
    await this.post('logout');
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

  async download(endpoint, queryParameters, fileName) {
    const response = await this.request(endpoint, queryParameters, this.buildFetchConfig('GET'));
    const responseBlob = await response.blob();
    saveAs(responseBlob, fileName);
  }

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

  async request(endpoint, queryParameters, fetchConfig) {
    const queryUrl = stringifyQuery(process.env.REACT_APP_API_URL, endpoint, queryParameters);
    const response = await Promise.race([fetch(queryUrl, fetchConfig), createTimeoutPromise()]);
    await verifyResponseStatus(response);
    return response;
  }

  buildFetchConfig(requestMethod, authHeader, body, isJson = true) {
    const fetchConfig = {
      method: requestMethod || 'GET',
      headers: {
        Authorization: authHeader,
      },
      credentials: 'include', // need to be set for cookies to save
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
