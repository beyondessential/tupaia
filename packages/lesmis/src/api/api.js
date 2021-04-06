/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_LESMIS_API_URL;
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
    const response = await axios(`${API_URL}${endpoint}`, {
      timeout,
      ...options,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { data } = error.response;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.message) {
        throw new Error(data.message);
      }
    }
    throw new Error(error);
  }
};

export const get = (endpoint, options) => request(endpoint, { method: 'get', ...options });

export const post = (endpoint, options) => request(endpoint, { method: 'post', ...options });

export const put = (endpoint, options) => request(endpoint, { method: 'put', ...options });

export const remove = endpoint => request(endpoint, { method: 'delete' });
