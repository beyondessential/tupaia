// eslint-disable-next-line no-unused-vars
import nodeFetch from 'node-fetch';
import { CustomError } from './errors';

const DEFAULT_MAX_WAIT_TIME = 120 * 1000; // 120 seconds in milliseconds

const buildParameterString = (key, value) => {
  return Array.isArray(value)
    ? value.map(v => buildParameterString(key, v)).join('&')
    : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

export const stringifyQuery = (baseUrl, endpoint, queryParams) => {
  const queryParamsString = Object.entries(queryParams || {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => buildParameterString(key, value))
    .join('&');

  const urlAndEndpoint = baseUrl ? `${baseUrl}/${endpoint}` : endpoint;

  return queryParamsString ? `${urlAndEndpoint}?${queryParamsString}` : `${urlAndEndpoint}`;
};

/**
 * Wrapper around node-fetch that adds timeout
 */
const createTimeoutPromise = maxWaitTime => {
  let cleanup;
  const promise = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Network request timed out'));
    }, maxWaitTime);
    cleanup = () => {
      clearTimeout(id);
      resolve();
    };
  });
  return { promise, cleanup };
};

/**
 * @param {string} url
 * @param {} [config]
 * @param {number} [maxWaitTime]
 * @return {Promise<NodeFetchResponse>}
 */
export const fetchWithTimeout = async (url, config, maxWaitTime = DEFAULT_MAX_WAIT_TIME) => {
  const { cleanup, promise: timeoutPromise } = createTimeoutPromise(maxWaitTime);
  try {
    const response = await Promise.race([nodeFetch(url, config), timeoutPromise]);
    return response;
  } finally {
    cleanup();
  }
};

/**
 * Takes in an object specification in the form
 * {
 *    key1: asynchronousValueFetchingFunction1,
 *    key2: asynchronousValueFetchingFunction2,
 * }
 * and runs the asynchronous value fetching functions in parallel, returning the object with the
 * values filled in the keys matching the structure passed in.
 * E.g.
 * const temparatures = await asynchronouslyFetchValuesForObject({
 *    currentTemperature: asyncFetchTempFromApi,
 *    yesterdaysTemperature: () => database.findOne('temparature', { date: new Date().getDate() - 1 }),
 * });
 * console.log(temperatures);
 * Might print
 * {
 *    currentTemperature: 24,
 *    yesterdaysTemperature: 22,
 * }
 * @param {object} objectSpecification An object specifying the keys to be filled in the return
 * object, along with asynchronous functions to fill each
 */
export const asynchronouslyFetchValuesForObject = async objectSpecification => {
  const returnObject = {};
  await Promise.all(
    Object.entries(objectSpecification).map(async ([key, asynchronouslyFetchValue]) => {
      returnObject[key] = await asynchronouslyFetchValue();
    }),
  );
  return returnObject;
};

const throwCustomError = (status, errorMessage, errorDetails) => {
  const statusCode = status || 500;
  throw new CustomError(
    {
      responseStatus: statusCode,
      responseText: errorMessage,
    },
    { errorDetails },
  );
};

export const verifyResponseStatus = async response => {
  if (!response.ok) {
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (error) {
      throw new Error(`Network error ${response.status}`);
    }
    if (
      response.status &&
      (response.status < 200 || response.status >= 300) &&
      !responseJson.error
    ) {
      throwCustomError(response.status, responseJson.message);
    }
    if (responseJson.error) {
      const { error: errorMessage, ...restOfError } = responseJson;
      throwCustomError(response.status, errorMessage, restOfError);
    }
  }
};
