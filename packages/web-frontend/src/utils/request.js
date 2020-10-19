/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import 'whatwg-fetch';
import downloadJs from 'downloadjs';
import { showSessionExpiredError, showServerUnreachableError } from '../actions';

/**
 * Returns the HTTP status code off an error response.
 *
 * @param {object} error An error response from a network request
 * @param {number} [defaultStatus] The default status if the status cannot be found.
 */
function getStatus(error, defaultStatus = 500) {
  return error.response ? error.response.status : defaultStatus;
}

/**
 * checks the error type and assign on error function action
 *
 * @param  {object} error   A error response from a network request
 * @param {function} defaultErrorFunction  Error function to be called
 *
 * @return {undefined} After asign the function throws an error
 */
function assignErrorAction(error, defaultErrorFunction, alwaysUseSuppliedErrorFunction = false) {
  const status = getStatus(error);
  const modifiedError = error;

  if (alwaysUseSuppliedErrorFunction) {
    modifiedError.errorFunction = defaultErrorFunction;
    return modifiedError;
  }

  switch (status) {
    case 440:
      modifiedError.errorFunction = showSessionExpiredError;
      break;
    case 500:
      modifiedError.errorFunction = showServerUnreachableError;
      break;
    default:
      modifiedError.errorFunction = defaultErrorFunction;
  }
  return modifiedError;
}

const inFlightRequests = {};

async function performJSONRequest(url, options) {
  const response = await fetch(url, options);

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
  return response.json();
}

async function performDeduplicatedRequest(url, options) {
  // Check if we already have a request for this resource in flight.
  const existingTask = inFlightRequests[url];
  if (existingTask) {
    return existingTask;
  }

  // It's a new request, let's create it.
  const hasQueryAlready = url.includes('?');
  const randomCacheBreaker = `${hasQueryAlready ? '&' : '?'}cacheBreaker=${Math.random()
    .toString(36)
    .substring(7)}`;

  const task = performJSONRequest(url + randomCacheBreaker, options);
  inFlightRequests[url] = task;

  try {
    // We need to await this promise because we don't want to execute the finally block until it's finished.
    return await task;
  } catch (error) {
    // Immediately rethrow - the network error thrown from fetch
    // is fine as-is, and we've already correctly constructed the
    // server error above. The reason for this try/catch block is
    // the finally, not the error handling.
    throw error;
  } finally {
    delete inFlightRequests[url];
  }
}

/**
 * Requests a URL, returning a promise
 *
 * @param {string} resourceUrl       The URL we want to request
 * @param {function} errorFunction  Error function on bad response in request
 * @param {object} [fetchOptions] The options we want to pass to "fetch"
 * @param {object} [requestContext] More context related values, these can be
 *       updated when a request has completed for more info about the request.
 *
 * @return {object}           The response data
 */
export default async function request(
  resourceUrl,
  errorFunction,
  options = {},
  requestContext = {},
  shouldRetryOnFail = true,
) {
  const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8080/api/v1/';
  try {
    return await performDeduplicatedRequest(baseUrl + resourceUrl, {
      ...options,
      credentials: 'include',
    });
  } catch (error) {
    if (shouldRetryOnFail) {
      return request(resourceUrl, errorFunction, options, requestContext, false);
    }
    throw assignErrorAction(
      error,
      errorFunction,
      options && options.alwaysUseSuppliedErrorFunction,
    );
  }
}

export const download = async (resourceUrl, errorFunction, options, fileName) => {
  const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8080/api/v1/';
  try {
    const response = await fetch(baseUrl + resourceUrl, {
      ...options,
      credentials: 'include',
    });

    if (response.status < 200 || response.status >= 300) {
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }

    const responseBlob = await response.blob();

    downloadJs(responseBlob, fileName);

    return true;
  } catch (error) {
    throw assignErrorAction(
      error,
      errorFunction,
      options && options.alwaysUseSuppliedErrorFunction,
    );
  }
};
