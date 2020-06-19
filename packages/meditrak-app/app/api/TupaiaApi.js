/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import { CLIENT_BASIC_AUTH_HEADER } from 'react-native-dotenv';

import { logoutWithError, receiveUpdatedAccessPolicy } from '../authentication/actions';
import { isBeta, betaBranch, getDeviceAppVersion } from '../version';

import { analytics } from '../utilities';

const AUTH_API_ENDPOINT = 'auth';
const CREATE_USER_ENDPOINT = 'user';
const CHANGE_USER_PASSWORD_ENDPOINT = 'me/changePassword';
const ACCESS_TOKEN_KEY = 'AccessToken';
const REFRESH_TOKEN_KEY = 'RefreshToken';
const SOCIAL_FEED_ENDPOINT = 'socialFeed';
const CURRENT_USER_REWARDS_ENDPOINT = 'me/rewards';
const DEV_BASE_URL = 'https://dev-api.tupaia.org/v2'; // Change this to 'http://[your-local-ip]:8090/v2' if running meditrak-server locally
const PRODUCTION_BASE_URL = `https://${isBeta ? `${betaBranch}-` : ''}api.tupaia.org/v2`;
export const BASE_URL = __DEV__ ? DEV_BASE_URL : PRODUCTION_BASE_URL;

const TIMEOUT_INTERVAL = 45 * 1000; // 45 seconds in milliseconds

export class TupaiaApi {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.reduxStore = null;
    this.connectionStatus = null;

    this.tokenPromise = this.retrieveAuthTokens(); // Async function that will complete some time after constructor
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  async reauthenticate(loginCredentials) {
    try {
      const response = await this.post(
        AUTH_API_ENDPOINT,
        null,
        JSON.stringify(loginCredentials),
        CLIENT_BASIC_AUTH_HEADER,
        false,
      );
      if (response.error) return response;
      const { accessToken, refreshToken, user } = response;
      if (!accessToken || !refreshToken || !user) {
        return { error: 'Invalid response from auth server' };
      }
      this.setAuthTokens(accessToken, refreshToken);
      return response;
    } catch (error) {
      throw error; // Throw error up
    }
  }

  setAuthTokens(accessToken = this.accessToken, refreshToken = this.refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.storeAuthTokens();
  }

  injectReduxStore(store) {
    this.reduxStore = store;
  }

  storeAuthTokens() {
    // This will happen asynchronously, but not worried about awaiting the result
    try {
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, this.accessToken);
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken);
    } catch (error) {
      // Silently ignore any async storage errors
    }
  }

  async retrieveAuthTokens() {
    try {
      const accessToken = (await AsyncStorage.getItem(ACCESS_TOKEN_KEY)) || this.accessToken;
      const refreshToken = (await AsyncStorage.getItem(REFRESH_TOKEN_KEY)) || this.refreshToken;
      if (accessToken && refreshToken) this.setAuthTokens(accessToken, refreshToken);
    } catch (error) {
      // Silently ignore any async storage errors
    } finally {
      this.tokenPromise = null;
    }
  }

  async getAccessToken() {
    if (this.tokenPromise) {
      await this.tokenPromise;
    }

    return this.accessToken;
  }

  async getBearerAuthHeader() {
    const accessToken = await this.getAccessToken();
    return `Bearer ${accessToken}`;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) return;
    let response = {};
    try {
      response = await this.post(
        AUTH_API_ENDPOINT,
        {
          grantType: 'refresh_token',
        },
        JSON.stringify({
          refreshToken: this.refreshToken,
        }),
        CLIENT_BASIC_AUTH_HEADER,
        false,
      );
    } catch (error) {
      return; // Silently swallow network errors etc, they will be picked up by the outer request
    }
    if (!response.accessToken) {
      this.reduxStore && this.reduxStore.dispatch(logoutWithError(response.error));
      return;
    }
    this.reduxStore.dispatch(receiveUpdatedAccessPolicy(response.user));
    this.setAuthTokens(response.accessToken, this.refreshToken);
  }

  async createUser(userFields) {
    try {
      const response = await this.post(
        CREATE_USER_ENDPOINT,
        null,
        JSON.stringify(userFields),
        CLIENT_BASIC_AUTH_HEADER,
        false,
      );

      return response;
    } catch (error) {
      throw error; // Throw error up
    }
  }

  async changeUserPassword(oldPassword, newPassword, newPasswordConfirm) {
    const response = await this.post(
      CHANGE_USER_PASSWORD_ENDPOINT,
      null,
      JSON.stringify({ oldPassword, newPassword, newPasswordConfirm }),
    );

    return response;
  }

  async getSocialFeed(page, earliestCreationDate) {
    const params = {
      page,
      earliestCreationDate,
    };

    return this.get(SOCIAL_FEED_ENDPOINT, params);
  }

  async getCurrentUserRewards() {
    const rewardsResult = await this.get(CURRENT_USER_REWARDS_ENDPOINT);
    if (rewardsResult.error) {
      throw rewardsResult.error;
    }

    return rewardsResult;
  }

  async getIsAuthenticated() {
    const accessToken = await this.getAccessToken();
    return accessToken && this.refreshToken !== null;
  }

  get(...params) {
    return this.request('GET', ...params);
  }

  post(...params) {
    return this.request('POST', ...params);
  }

  handleConnectivityChange = isConnected => {
    this.connectionStatus = isConnected;
  };

  getQueryUrl = (endpoint, queryParamsIn) => {
    const queryParams = { appVersion: getDeviceAppVersion(), ...queryParamsIn };
    const queryParamsString = Object.entries(queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return `${BASE_URL}/${endpoint}?${queryParamsString}`;
  };

  async request(
    requestMethod,
    apiEndpoint,
    queryParameters,
    body,
    overriddenAuthHeader = null,
    shouldReauthenticateIfUnauthorized = true,
  ) {
    const authHeader = overriddenAuthHeader || (await this.getBearerAuthHeader());

    analytics.trackEvent('Request attempted', {
      requestMethod,
      apiEndpoint,
    });

    if (!this.connectionStatus) {
      analytics.trackEvent('Request attempted offline', {
        requestMethod,
        apiEndpoint,
      });
      throw new Error('Network not connected');
    }

    const queryUrl = this.getQueryUrl(apiEndpoint, queryParameters);
    const fetchConfig = {
      method: requestMethod,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    };
    if (body) fetchConfig.body = body;
    try {
      const response = await Promise.race([fetch(queryUrl, fetchConfig), createTimeoutPromise()]);
      // If server responded with 401, i.e. not authenticated, refresh token and try once more
      if (
        shouldReauthenticateIfUnauthorized &&
        response.status === 401 &&
        this.refreshToken !== null
      ) {
        try {
          await this.refreshAccessToken();
          return this.request(requestMethod, apiEndpoint, queryParameters, body, null, false);
        } catch (error) {
          throw error;
        }
      }

      const responseJson = await response.json();
      // If server responded with 410, i.e. old API version, log the user out and get them to update
      if (response.status === 410 && this.reduxStore) {
        this.reduxStore.dispatch(logoutWithError(responseJson.error));
      }
      // If the server responded with any other error code but failed to supply an error, add one
      if (
        (response.status < 200 ||
          response.status >= 300 ||
          (responseJson.status && (responseJson.status < 200 || responseJson.status >= 300))) &&
        !responseJson.error
      ) {
        responseJson.error = responseJson.message || `Network error ${response.status}`;

        analytics.trackEvent('Request failed', {
          requestMethod,
          apiEndpoint,
          error: responseJson.error,
        });
      } else {
        analytics.trackEvent('Request succeeded', {
          requestMethod,
          apiEndpoint,
        });
      }
      return responseJson;
    } catch (error) {
      throw error;
    }
  }
}

// Create a promise that rejects after the request has taken too long
const createTimeoutPromise = () =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject({ message: 'Network request timed out' });
    }, TIMEOUT_INTERVAL);
  });
