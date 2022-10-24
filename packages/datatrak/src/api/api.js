/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import axios from 'axios';
import FetchError from './fetchError';

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

const timeout = 45 * 1000; // 45 seconds

const baseUrl = 'http://localhost:3000';

const getRequestOptions = options => {
  const locale = window.location.pathname.split('/')[1];
  return {
    ...options,
    timeout,
    params: {
      ...options.params,
      locale,
    },
  };
};

/**
 * Abstraction for making api requests
 * @see: https://github.com/axios/axios for docs on options
 *
 * @param endpoint
 * @param options
 * @returns {AxiosPromise}
 */
const request = async (endpoint, options) => {
  const requestOptions = getRequestOptions(options);

  try {
    const response = await axios(`${baseUrl}/v1/${endpoint}`, requestOptions);
    return response.data;
  } catch (error) {
    // normalise errors using fetch error class
    if (error.response) {
      const { data } = error.response;

      // logout the user out if we get a 401 response
      if (error.response.status === 401 || data.code === 401) {
        request('logout', { method: 'post' });
      }

      if (data.error) {
        throw new FetchError(data.error, error.response.status);
      }

      if (data.message) {
        throw new FetchError(data.message, data.code);
      }
    }
    throw new Error(error);
  }
};

export const get = (endpoint, options) => request(endpoint, { method: 'get', ...options });

export const post = (endpoint, options) => request(endpoint, { method: 'post', ...options });

export const put = (endpoint, options) => request(endpoint, { method: 'put', ...options });

export const remove = endpoint => request(endpoint, { method: 'delete' });
