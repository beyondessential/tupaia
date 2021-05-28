/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';

const timeout = 45 * 1000; // 45 seconds

const getApiUrl = () => {
  // prefer any url set in the environment variables
  if (process.env.REACT_APP_LESMIS_API_URL) {
    return process.env.REACT_APP_LESMIS_API_URL;
  }

  // if no env var, use sensible defaults based on the front end url
  const { hostname } = window.location; // eslint-disable-line no-undef

  // localhost becomes http://localhost:8060
  if (hostname === 'localhost') {
    return 'http://localhost:8060';
  }

  const domainComponents = hostname.split('.');

  // lesmis.la becomes https://api.lesmis.la
  if (domainComponents.length === 2) {
    const [domain, tld] = domainComponents;
    return `https://api.${domain}.${tld}`;
  }
  const [subdomain, domain, tld] = domainComponents;

  // www.lesmis.la becomes https://api.lesmis.la
  if (subdomain === 'www') {
    return `https://api.${domain}.${tld}`;
  }

  // lesmis.tupaia.org becomes https://lesmis-api.tupaia.org, and dev-lesmis.tupaia.org becomes
  // https://dev-lesmis-api.tupaia.org
  return `https://${subdomain}-api.${domain}.${tld}`;
};

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
    const response = await axios(`${getApiUrl()}${endpoint}`, {
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
