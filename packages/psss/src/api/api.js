/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import axios from 'axios';

const PSSS_API_URL = process.env.REACT_APP_PSSS_API_URL;

/*
 * This module is responsible for pure api abstractions
 */
const headers = { 'X-Custom-Header': 'foobar' };
const timeout = 45 * 1000;

const request = async (endpoint, options) => {
  // if (body) {
  //   fetchConfig.body =
  //     typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
  // }

  const response = await axios(`${PSSS_API_URL}/${endpoint}`, { headers, timeout, ...options });

  // Todo: check whether this is still needed
  if (!response.ok) {
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (error) {
      throw new Error(`Network error ${response.status}`);
    }
    if (
      responseJson.status &&
      (responseJson.status < 200 || responseJson.status >= 300) &&
      !responseJson.error
    ) {
      throw new Error(responseJson.message);
    }
    if (responseJson.error) {
      throw new Error(responseJson.error);
    }
  }

  return response.data;
};

export const get = (endpoint, options) => request(endpoint, { method: 'get', ...options });

export const post = (endpoint, options) => request(endpoint, { method: 'post', ...options });

export const put = (endpoint, options) => request(endpoint, { method: 'put', ...options });

export const remove = endpoint => request(endpoint, { method: 'delete' });
