/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import axios from 'axios';

/*
 * This module is responsible for pure api abstractions and should be agnostic of specific apis
 */
const headers = { 'X-Custom-Header': 'foobar' };
const timeout = 45 * 1000;

const request = async (url, options) => {
  // if (body) {
  //   fetchConfig.body =
  //     typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
  // }

  const response = await axios(url, { headers, timeout, ...options });

  // Todo: check whether this is still needed
  if (!response.ok) {
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (error) {
      throw new Error(`Network error ${response.status}`);
    }
    if (
      responseJson.status &&
      (responseJson.status < 200 || responseJson.status >= 300) &&
      !responseJson.error
    ) {
      throw new Error(responseJson.message);
    }
    if (responseJson.error) {
      throw new Error(responseJson.error);
    }
  }

  return response.data;
};

export const get = (url, options) => request(url, { method: 'get', ...options });

export const post = (url, options) => request(url, { method: 'post', ...options });

export const put = (url, options) => request(url, { method: 'put', ...options });

export const remove = url => request(url, { method: 'delete' });
