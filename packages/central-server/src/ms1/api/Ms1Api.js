/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { fetchWithTimeout, HttpError } from '@tupaia/utils';

export class Ms1Api {
  constructor() {
    this.serverUrl = process.env.MS1_URL;
  }

  async getAccessToken() {
    const currentServerTime = Date.now();
    if (!this.accessToken || currentServerTime > this.accessTokenExpiry) {
      const { MS1_USERNAME, MS1_PASSWORD } = process.env;
      const body = JSON.stringify({
        username: MS1_USERNAME,
        password: MS1_PASSWORD,
      });
      const accessTokenResponse = await this.fetch('authenticate', { body, method: 'POST' }, false);
      this.accessTokenExpiry = currentServerTime + accessTokenResponse.expiresIn;
      this.accessToken = accessTokenResponse.token;
    }
    return this.accessToken;
  }

  /**
   * Provides a simple fetch-like API for communicating with MS1 API. Takes care of
   * the auth and the base URL, so consumer just needs to pass through the endpoint (with any query
   * string included on the end) and any additional fetch config (e.g. the request body)
   */
  async fetch(endpoint, config = {}, needsAuth = true) {
    let accessToken = null;
    if (needsAuth) accessToken = await this.getAccessToken();
    const fetchConfig = {
      method: 'GET', // Acts as default http method, will be overridden if method passed in config
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      ...config,
    };
    const url = `${this.serverUrl}/api/v1/${endpoint}`;
    // Uncomment for debugging requests to MS-1
    // console.log(`Fetching ${url}`);
    const response = await fetchWithTimeout(url, fetchConfig);
    if (!response.ok) {
      throw new HttpError(response);
    }
    return response.json();
  }

  async postData(data, endpoint) {
    return this.fetch(endpoint, { body: JSON.stringify(data), method: 'POST' });
  }

  async putData(data, endpoint) {
    return this.fetch(endpoint, { body: JSON.stringify(data), method: 'PUT' });
  }
}
