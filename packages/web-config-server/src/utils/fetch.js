/**
 * Wrapper around node-fetch that adds timeout
 */
import nodeFetch from 'node-fetch';

const FETCH_TIMEOUT = 120 * 1000; // 120 seconds in milliseconds

export const fetch = (url, config) =>
  Promise.race([nodeFetch(url, config), createTimeoutPromise()]);

// Create a promise that rejects after the request has taken too long
const createTimeoutPromise = () =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject({ message: 'Network request timed out' });
    }, FETCH_TIMEOUT);
  });
