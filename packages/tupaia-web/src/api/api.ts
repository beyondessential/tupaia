import axios from 'axios';
import FetchError from './fetchError';

export const API_URL = import.meta.env.REACT_APP_TUPAIA_WEB_API_URL || 'http://localhost:8100/v1';

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

const timeout = 45 * 1000; // 45 seconds

type RequestParameters = Record<string, any> & {
  params?: Record<string, any>;
  cancelOnUnmount?: boolean;
  returnHeaders?: boolean;
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

const getErrorMessage = (error: any) => {
  const { data } = error.response;

  let message = error.message;

  // Some of the endpoints return 'details' with the message instead of 'message' or 'error'
  if (data.details) {
    message = data.details;
  }

  if (data.error) {
    message = data.error;
  }

  if (data.message) {
    message = data.message;
  }

  // remove axios `api error ...:` prefix
  return message?.includes(':') ? message?.split(': ').slice(1).join(': ') : message;
};

// Todo: Move api request util to ui-components and allow for mapping to backend request type safety

/**
 * This method handles the actual request to the API. It will throw an error if the response is not ok.
 */
const request = async (endpoint: string, options?: RequestParametersWithMethod) => {
  const { returnHeaders, ...requestOptions } = getRequestOptions(options);

  try {
    const response = await axios(`${API_URL}/${endpoint}`, requestOptions);

    if (returnHeaders) return response;
    return response.data;
  } catch (error: any) {
    // don't throw when is cancelled
    if (axios.isCancel(error)) return;
    // normalise errors using fetch error class
    if (error.response) {
      const { data } = error.response;
      let errorObject = error;

      // This is usually in the case of data downloads, which means the error is formatted differently because we request a blob
      if (data instanceof Blob) {
        const result = JSON.parse(await data.text());
        errorObject = {
          response: {
            status: result.code,
            data: result,
          },
        };
      }

      const message = getErrorMessage(errorObject);

      const code = data.message ? data.code : error.response.status;

      throw new FetchError(message, code);
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
