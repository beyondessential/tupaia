/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import nodeFetch from 'node-fetch';

const DEFAULT_MAX_WAIT_TIME = 45 * 1000; // 45 seconds in milliseconds

const buildParameterString = (key, value) => {
  return Array.isArray(value)
    ? value.map(v => buildParameterString(key, v)).join('&')
    : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

export const stringifyQuery = (baseUrl, endpoint, queryParams) => {
  const queryParamsString = Object.entries(queryParams || {})
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => buildParameterString(key, value))
    .join('&');

  return queryParamsString
    ? `${baseUrl}/${endpoint}?${queryParamsString}`
    : `${baseUrl}/${endpoint}`;
};

// Create a promise that rejects after the request has taken too long
const createTimeoutPromise = maxWaitTime =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Network request timed out'));
    }, maxWaitTime);
  });

/**
 * Wrapper around node-fetch that adds timeout
 */
export const fetchWithTimeout = (url, config, maxWaitTime = DEFAULT_MAX_WAIT_TIME) =>
  Promise.race([nodeFetch(url, config), createTimeoutPromise(maxWaitTime)]);
