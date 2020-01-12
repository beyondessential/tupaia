/**
 * Wrapper around node-fetch that adds timeout
 */
import nodeFetch from 'node-fetch';

const DEFAULT_MAX_WAIT_TIME = 45 * 1000; // 45 seconds in milliseconds

export const fetchWithTimeout = (url, config, maxWaitTime = DEFAULT_MAX_WAIT_TIME) =>
  Promise.race([nodeFetch(url, config), createTimeoutPromise(maxWaitTime)]);

// Create a promise that rejects after the request has taken too long
const createTimeoutPromise = maxWaitTime =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Network request timed out'));
    }, maxWaitTime);
  });
