import axios from 'axios';

const PSSS_API_URL = process.env.REACT_APP_PSSS_API_URL || 'http://localhost:8040/v1';
const timeout = 45 * 1000;

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

/**
 * Abstraction for making api requests
 * @see: https://github.com/axios/axios for docs on options
 *
 * @param endpoint
 * @param options
 * @returns {Promise<boolean|*>}
 */
const request = async (endpoint, options) => {
  try {
    const { data } = await axios(`${PSSS_API_URL}/${endpoint}`, {
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

export const remove = (endpoint, options) => request(endpoint, { method: 'delete', ...options });
