/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';
import FetchError from './fetchError';

const baseUrl = process.env.REACT_APP_API_URL;
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
