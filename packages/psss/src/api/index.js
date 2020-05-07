/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

//export { TupaiaApi } from './TupaiaApi';

import axios from 'axios';

const { PSSS_API_URL, PSSS_API_AUTH_PATH } = process.env;
const DEFAULT_RESOURCES = ['alerts'];
const AUTH_API_ENDPOINT = `${PSSS_API_URL}${PSSS_API_AUTH_PATH}`;

async function getAccessToken() {
  if (!this.getRefreshToken()) return;
  let response = { body: {} };
  try {
    response = await axios.post(
      AUTH_API_ENDPOINT,
      {
        grantType: 'refresh_token',
      },
      {
        refreshToken: this.getRefreshToken(),
      },
      process.env.REACT_APP_CLIENT_BASIC_AUTH_HEADER,
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

const performRequest = () => {};

const getResourceInterface = name => {
  const endpoint = `${process.env.PSSS_API_URL}/${name}`;

  return {
    async post(body) {
      return axios.post(endpoint, body);
    },

    async get(id = null) {
      return axios.get(`${endpoint}${id ? `/${id}` : ''}`, body);
    },
  };
};

export const getApi = (resources = DEFAULT_RESOURCES) => {
  const interface = {};

  for (const name of resources) {
    interface[name] = getResourceInterface(name);
  }

  return interface;
};
