import axios from 'axios';
import FetchError from './fetchError';

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

export const timeout = 45 * 1000; // 45 seconds

export type RequestParameters = Record<string, any> & {
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

export const request = async (baseUrl, endpoint: string, options?: RequestParametersWithMethod) => {
  const requestOptions = getRequestOptions(options);

  try {
    const response = await axios(`${baseUrl}/${endpoint}`, requestOptions);

    return response.data;
  } catch (error: any) {
    // normalise errors using fetch error class
    if (error.response) {
      const { data } = error.response;

      // Some of the endpoints return 'details' with the message instead of 'message' or 'error'
      if (data.details) {
        throw new FetchError(data.details, error.response.status, data);
      }

      if (data.error) {
        throw new FetchError(data.error, error.response.status, data);
      }

      if (data.message) {
        throw new FetchError(data.message, data.code, data);
      }
    }
    throw new Error(error);
  }
};
