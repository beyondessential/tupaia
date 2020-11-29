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

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

const request = async (endpoint, options) => {
  // Don't need as By default, axios serializes JavaScript objects to JSON
  // if (body) {
  //   fetchConfig.body =
  //     typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
  // }

  try {
    const { data } = await axios(`${PSSS_API_URL}/${endpoint}`, {
      headers,
      timeout,
      ...options,
    });
    return data;
  } catch (error) {
    if (error.response) {
      const { data } = error.response;
      if (data.error) {
        throw new Error(data.error);
      } else if (data.message) {
        throw new Error(data.message);
      }
    } else {
      throw new Error('Network error. Please try again');
    }
    return false;
  }
};

export const get = (endpoint, options) => request(endpoint, { method: 'get', ...options });

export const post = (endpoint, options) => request(endpoint, { method: 'post', ...options });

export const put = (endpoint, options) => request(endpoint, { method: 'put', ...options });

export const remove = endpoint => request(endpoint, { method: 'delete' });
