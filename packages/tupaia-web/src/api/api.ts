/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';
import FetchError from './fetchError';

export const API_URL = import.meta.env.REACT_APP_TUPAIA_WEB_API_URL || 'http://localhost:8100/v1';

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

const timeout = 45 * 1000; // 45 seconds

type RequestParameters = Record<string, any> & {
  params?: Record<string, any>;
  cancelOnUnmount?: boolean;
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
    // don't throw when is cancelled
    if (axios.isCancel(error)) return;
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

/**
 * This method handles query cancellation. Because we are using an older version of react-query, we still need to handle cancellation the old way: https://tanstack.com/query/v3/docs/react/guides/query-cancellation#old-cancel-function
 */
export const get = (endpoint: string, options?: RequestParameters) => {
  // cancelOnUnmount is true by default. It can be opted out of by setting cancelOnUnmount to false in the options object
  const { cancelOnUnmount = true, ...rest } = options || {};

  const controller = cancelOnUnmount ? new AbortController() : null;
  const promise = request(endpoint, {
    method: 'get',
    ...rest,
    signal: controller?.signal,
  }) as Promise<any> & {
    cancel?: () => void;
  };

  if (cancelOnUnmount) {
    promise.cancel = () => controller?.abort();
  }

  return promise;
};

export const post = (endpoint: string, options?: RequestParameters) =>
  request(endpoint, { method: 'post', ...options });

export const put = (endpoint: string, options?: RequestParameters) =>
  request(endpoint, { method: 'put', ...options });

export const remove = (endpoint: string) => request(endpoint, { method: 'delete' });
