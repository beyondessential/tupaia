import winston from 'winston';

import { fetchWithTimeout, createBearerHeader } from '@tupaia/utils';
import { authenticateWithDhis } from './authenticateWithDhis';
import { checkIsImportResponse } from './responseUtils';
import { stringifyDhisQuery } from './stringifyDhisQuery';
import { DHIS2_RESOURCE_TYPES } from './types';

const CACHEABLE_ENDPOINTS = [
  DHIS2_RESOURCE_TYPES.PROGRAM,
  DHIS2_RESOURCE_TYPES.ORGANISATION_UNIT,
  DHIS2_RESOURCE_TYPES.ORGANISATION_UNIT_GROUP,
  DHIS2_RESOURCE_TYPES.OPTION,
  DHIS2_RESOURCE_TYPES.OPTION_SET,
  DHIS2_RESOURCE_TYPES.DATA_ELEMENT,
  DHIS2_RESOURCE_TYPES.DATA_ELEMENT_GROUP,
  DHIS2_RESOURCE_TYPES.DATA_ELEMENT_GROUP_SET,
  DHIS2_RESOURCE_TYPES.TRACKED_ENTITY_ATTRIBUTE,
  DHIS2_RESOURCE_TYPES.TRACKED_ENTITY_INSTANCE,
  DHIS2_RESOURCE_TYPES.TRACKED_ENTITY_TYPE,
];
// Don't cache data if endpoint not listed as cacheable (e.g. /analytics, /events, etc.) or if it is
// for a modifying http method, e.g. POST
const getIsCacheable = (endpoint, httpMethod) =>
  CACHEABLE_ENDPOINTS.includes(endpoint) && httpMethod === 'GET';

const MAX_FETCH_WAIT_TIME = 120 * 1000; // 120 seconds allows longer running DHIS fetches to succeed

/**
 * Handles auth, fetching, and caching the more stable responses from dhis2 endpoints
 */
export class DhisFetcher {
  constructor(serverName, serverUrl, constructError) {
    this.serverName = serverName;
    this.serverUrl = serverUrl;
    this.cache = {};
    this.accessTokenPromise = null;
    this.constructError = constructError;
  }

  async requestAccessToken() {
    const { token } = await authenticateWithDhis(this.serverName, this.serverUrl);
    this.accessTokenExpiry = token.expires_at.valueOf(); // expires_at is a Date
    return token.access_token;
  }

  clearAccessToken() {
    this.accessTokenPromise = null;
    this.accessTokenExpiry = null;
  }

  async getAccessToken() {
    const currentServerTime = Date.now();
    if (this.accessTokenExpiry && currentServerTime > this.accessTokenExpiry) {
      // token is expired, clear it
      this.clearAccessToken();
    }

    if (!this.accessTokenPromise) {
      // Not currently running an auth request, start one
      this.accessTokenPromise = this.requestAccessToken();
    }

    try {
      const accessToken = await this.accessTokenPromise;
      return accessToken;
    } catch (e) {
      this.clearAccessToken();
      throw this.constructError(`Authentication with DHIS2 failed: ${e.message}`);
    }
  }

  /**
   * Provides a simple fetch-like API for communicating with DHIS2 aggregation server. Takes care of
   * the auth and the base URL, so consumer just needs to pass through the endpoint (with any query
   * string included on the end) and any additional fetch config (e.g. the request body)
   */
  async fetch(endpoint, queryParameters = {}, config = {}, shouldRetryOnBadAuth = true) {
    const accessToken = await this.getAccessToken();
    const fetchConfig = {
      method: 'GET', // Acts as default http method, will be overridden if method passed in config
      headers: {
        Authorization: createBearerHeader(accessToken),
        'Content-Type': 'application/json',
      },
      ...config,
    };
    const queryString = stringifyDhisQuery({
      paging: false,
      ...queryParameters,
    }); // Turn off dhis2 paging
    const url = `${this.serverUrl}/api/${endpoint}${queryString}`;

    // Uncomment for debugging requests to DHIS2
    // winston.debug('DHIS2 request', { url, endpoint, ...queryParameters });
    const [baseEndpoint, recordId] = endpoint.split('/');
    const { method: httpMethod } = fetchConfig;
    const cachedResponse = getIsCacheable(baseEndpoint, httpMethod) && this.cache[url];
    if (cachedResponse) {
      return cachedResponse;
    }
    const response = await fetchWithTimeout(url, fetchConfig, MAX_FETCH_WAIT_TIME);

    if (response.ok) {
      try {
        const responseObject = await response.json();
        if (getIsCacheable(baseEndpoint, httpMethod)) {
          // if no recordId was provided, matching records are stored under responseObject[endpoint]
          // if recordId was provided, the structure is less predictable, but it would have 404'd if
          // there was no matching record
          const foundRecords = recordId || responseObject[baseEndpoint].length > 0;
          if (foundRecords) this.cache[url] = responseObject;
        }
        return responseObject;
      } catch (error) {
        // deletes return an invalid body for json() to parse.
        if (error.type === 'invalid-json' && config.method === 'DELETE') return {};
        if (response.statusText) throw this.constructError(response.statusText, url);
        throw this.constructError(error.message, url);
      }
    }

    if (response.status === 401 && shouldRetryOnBadAuth) {
      this.clearAccessToken(); // Clear the current access token to force a new one on next fetch
      return this.fetch(endpoint, queryParameters, config, false);
    }
    winston.warn(`Error communicating with ${url} with the following config:`, config);
    let errorMessage = response.statusText;
    // Attempt to get more specific message from DHIS2
    try {
      const responseObject = await response.json();
      const { message } = responseObject;
      winston.info(message);
      if (checkIsImportResponse(responseObject)) {
        // Special case when a "not ok" response contains error diagnostics
        return responseObject;
      }
      if (message) errorMessage = message;
    } catch (e) {
      // Ignore json parse errors in bad responses
    }
    throw this.constructError(errorMessage, url);
  }
}
