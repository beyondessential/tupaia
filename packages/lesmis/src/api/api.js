/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_CONFIG_SERVER_BASE_URL;
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
const request = (endpoint, options) =>
  axios(`${API_URL}${endpoint}`, {
    timeout,
    ...options,
  }).then(res => res.data);

export const get = (endpoint, options) => request(endpoint, { method: 'get', ...options });

export const post = (endpoint, options) => request(endpoint, { method: 'post', ...options });

export const put = (endpoint, options) => request(endpoint, { method: 'put', ...options });

export const remove = endpoint => request(endpoint, { method: 'delete' });
