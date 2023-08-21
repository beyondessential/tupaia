/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';
import FetchError from './fetchError';

// TODO: change this to be the correct default url when orchestration server is ready
export const API_URL = import.meta.env.REACT_APP_DATATRAK_WEB_API_URL || 'http://localhost:8100/v1';

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

const timeout = 45 * 1000; // 45 seconds

type RequestParameters = Record<string, any> & {
  params?: Record<string, any>;
};

type RequestParametersWithMethod = RequestParameters & {
  method: 'get' | 'post' | 'put' | 'delete';
};
const getRequestOptions = (options?: RequestParametersWithMethod) => {
  return {
    ...options,
    timeout,
  };
};

// Todo: Move api request util to ui-components and allow for mapping to backend request type safety
const request = async (endpoint: string, options?: RequestParametersWithMethod) => {
  const requestOptions = getRequestOptions(options);

  try {
    const response = await axios(`${API_URL}/${endpoint}`, requestOptions);

    return response.data;
  } catch (error: any) {
    // normalise errors using fetch error class
    if (error.response) {
      const { data } = error.response;

      // Some of the endpoints return 'details' with the message instead of 'message' or 'error'
      if (data.details) {
        throw new FetchError(data.details, error.response.status);
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

export const get = (endpoint: string, options?: RequestParameters) =>
  request(endpoint, { method: 'get', ...options });

export const post = (endpoint: string, options?: RequestParameters) =>
  request(endpoint, { method: 'post', ...options });

export const put = (endpoint: string, options?: RequestParameters) =>
  request(endpoint, { method: 'put', ...options });

export const remove = (endpoint: string) => request(endpoint, { method: 'delete' });
