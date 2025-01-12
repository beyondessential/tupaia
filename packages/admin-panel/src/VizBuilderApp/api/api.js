import axios from 'axios';
import { saveAs } from 'file-saver';
import FetchError from './fetchError';

const baseUrl = import.meta.env.REACT_APP_VIZ_BUILDER_API_URL || 'http://localhost:8070/v1';
const timeout = 45 * 1000; // 45 seconds

// withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
axios.defaults.withCredentials = true;

/**
 * Abstraction for making api requests
 * @see: https://github.com/axios/axios for docs on options
 *
 * @param endpoint
 * @param options
 * @returns {AxiosPromise}
 */
const request = async (endpoint, options) => {
  try {
    const response = await axios(`${baseUrl}/${endpoint}`, {
      timeout,
      ...options,
    });
    return response.data;
  } catch (error) {
    // normalise errors using fetch error class
    if (error.response) {
      const { data } = error.response;

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

export const download = async (endpoint, options, fileName) => {
  const method = options?.data ? 'post' : 'get';
  const response = await request(endpoint, { method, ...options, responseType: 'blob' });
  saveAs(response, fileName);
};

export const upload = async (endpoint, options, fileName, file) => {
  const data = new FormData();
  data.append(fileName, file);
  return request(endpoint, { method: 'post', ...options, data });
};

/**
 * @param {string} method
 * @param {string} endpoint
 * @param {{[key: string]: File}} [filesByMultipartKey]
 * @param {{}} [payload] The multipartJson part which is not a file. Sent as JSON.
 */
export const multipart = async ({ method, endpoint, filesByMultipartKey = {}, payload }) => {
  const formData = new FormData();
  Object.entries(filesByMultipartKey).forEach(([key, file]) => formData.append(key, file));
  if (payload) {
    formData.append('payload', JSON.stringify(payload));
  }
  return request(endpoint, { data: formData, method });
};
