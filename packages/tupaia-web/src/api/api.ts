/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';
import FetchError from './fetchError';
import { getApiUrl } from '../utils';

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

const timeout = 45 * 1000; // 45 seconds

type RequestParameters = Record<string, any> & {
  params?: Record<string, any>;
};

type RequestParametersWithMethod = RequestParameters & {
  method: 'get' | 'post' | 'put' | 'delete';
};
const getRequestOptions = (options: RequestParametersWithMethod) => {
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

const request = async (endpoint: string, options: RequestParametersWithMethod) => {
  const requestOptions = getRequestOptions(options);

  try {
    const response = await axios(`${getApiUrl()}/${endpoint}`, requestOptions);
    return response.data;
  } catch (error: any) {
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

export const get = (endpoint: string, options: RequestParameters) =>
  request(endpoint, { method: 'get', ...options });

export const post = (endpoint: string, options: RequestParameters) =>
  request(endpoint, { method: 'post', ...options });

export const put = (endpoint: string, options: RequestParameters) =>
  request(endpoint, { method: 'put', ...options });

export const remove = (endpoint: string) => request(endpoint, { method: 'delete' });
