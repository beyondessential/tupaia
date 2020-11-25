/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import axios from 'axios';

/*
 * This module is responsible for pure api abstractions and should be agnostic of specific apis
 */
const headers = { 'X-Custom-Header': 'foobar' };
const timeout = 30 * 1000;

const request = async (url, options) => {
  const response = await axios(url, { headers, timeout, ...options });
  return response.data;
};

export const get = (url, options) => request(url, { method: 'get', ...options });

export const post = (url, options) => request(url, { method: 'post', ...options });

export const put = (url, options) => request(url, { method: 'put', ...options });

export const remove = url => request(url, { method: 'delete' });
